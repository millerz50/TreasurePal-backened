import cookie from "cookie";
import { Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { uploadToFirebase } from "../lib/firebaseUpload";
import { logger } from "../lib/logger";
import { comparePassword } from "../lib/utils/auth";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

import {
  createAgent,
  deleteAgent,
  getAgentByEmail,
  getAllAgents,
  updateAgent,
} from "../services/agentService";
import { generateOtp, verifyOtp } from "../services/otpService";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function login(req: AuthenticatedRequest, res: Response) {
  const { email, password } = req.body;
  logger.info(`Login attempt for email: ${email}`);

  try {
    const agent = await getAgentByEmail(email);
    if (!agent) {
      logger.warn(`Login failed: Agent not found for email ${email}`);
      return res.status(404).json({ error: "Agent not found" });
    }

    const isMatch = await comparePassword(password.trim(), agent.password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid credentials for email ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { agentId: agent.agentId, role: agent.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    logger.info(`Login successful for agentId: ${agent.agentId}`);

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 2 * 60 * 60,
        path: "/",
      })
    );

    res.status(200).json({
      message: "Login successful",
      agent: {
        email: agent.email,
        agentId: agent.agentId,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Login error for ${email}: ${message}`, err);
    res.status(500).json({ error: "Login failed", details: message });
  }
}

export async function register(req: AuthenticatedRequest, res: Response) {
  const { firstName, surname, email } = req.body;
  logger.info(`Registering agent: ${email}`);

  try {
    const imageBuffer = req.file?.buffer;
    const imageName = req.file?.originalname;

    if (!imageBuffer || !imageName) {
      logger.warn(`Registration failed: Missing image for ${email}`);
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageUrl = await uploadToFirebase(imageBuffer, imageName);
    const agent = await createAgent({ ...req.body, imageUrl });

    logger.info(`Agent registered: ${agent.agentId}`);
    res.status(201).json(agent);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Agent registration failed for ${email}: ${message}`, err);
    res.status(500).json({ error: "Agent creation failed", details: message });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  const agentId = req.params.agentId;
  logger.info(`Updating agent: ${agentId}`);

  try {
    const agent = await updateAgent(agentId, req.body);
    logger.info(`Agent updated: ${agentId}`);
    res.json(agent);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Update failed for agent ${agentId}: ${message}`, err);
    res.status(500).json({ error: "Update failed", details: message });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  const agentId = req.params.agentId;
  logger.info(`Deleting agent: ${agentId}`);

  try {
    await deleteAgent(agentId);
    logger.info(`Agent deleted: ${agentId}`);
    res.json({ message: "Agent deleted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Delete failed for agent ${agentId}: ${message}`, err);
    res.status(500).json({ error: "Delete failed", details: message });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  logger.info("Fetching agent list");

  try {
    const agents = await getAllAgents();
    logger.info(`Fetched ${agents.length} agents`);
    res.json(agents);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to fetch agents: ${message}`, err);
    res.status(500).json({ error: "Failed to fetch agents", details: message });
  }
}

export async function sendOtp(req: AuthenticatedRequest, res: Response) {
  const { email } = req.body;
  logger.info(`Sending OTP to ${email}`);

  try {
    const otp = generateOtp(email);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"TreasurePal Verification" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your TreasurePal OTP Code",
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
    });

    logger.info(`OTP sent to ${email}`);
    res.json({ message: "OTP sent" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to send OTP to ${email}: ${message}`, err);
    res.status(500).json({ error: "Failed to send OTP", details: message });
  }
}

export async function verifyOtpCode(req: AuthenticatedRequest, res: Response) {
  const { email, otp } = req.body;
  logger.info(`Verifying OTP for ${email}`);

  try {
    const valid = verifyOtp(email, otp);
    if (!valid) {
      logger.warn(`Invalid OTP for ${email}`);
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    logger.info(`OTP verified for ${email}`);
    res.json({ message: "OTP verified" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`OTP verification failed for ${email}: ${message}`, err);
    res
      .status(500)
      .json({ error: "OTP verification failed", details: message });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.agent || !req.agent.agentId) {
    logger.warn("Unauthorized profile access attempt");
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid token payload" });
  }

  const agentId = req.agent.agentId;
  logger.info(`Fetching profile for agentId: ${agentId}`);

  try {
    const agent = await getAgentByEmail(req.agent.email);
    if (!agent) {
      logger.warn(`Profile not found for agentId: ${agentId}`);
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      email: agent.email,
      agentId: agent.agentId,
      role: agent.role,
      status: agent.status,
      imageUrl: agent.imageUrl,
      firstName: agent.firstName,
      surname: agent.surname,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to fetch profile for ${agentId}: ${message}`, err);
    res
      .status(500)
      .json({ error: "Failed to fetch profile", details: message });
  }
}
