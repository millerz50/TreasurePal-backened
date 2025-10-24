import cookie from "cookie";
import { Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
  const agent = await getAgentByEmail(email);
  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const isMatch = await comparePassword(password.trim(), agent.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { agentId: agent.agentId, role: agent.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

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
}

export async function register(req: AuthenticatedRequest, res: Response) {
  const agent = await createAgent(req.body);
  res.status(201).json(agent);
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.agent || !req.agent.agentId) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid token payload" });
  }

  // ✅ Now TypeScript knows req.agent is defined
  const agentId = req.agent.agentId;
}
export async function update(req: AuthenticatedRequest, res: Response) {
  const agent = await updateAgent(req.params.agentId, req.body);
  res.json(agent);
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  await deleteAgent(req.params.agentId);
  res.json({ message: "Agent deleted" });
}

export async function list(req: AuthenticatedRequest, res: Response) {
  const agents = await getAllAgents();
  res.json(agents);
}

export async function sendOtp(req: AuthenticatedRequest, res: Response) {
  const { email } = req.body;
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

  res.json({ message: "OTP sent" });
}

export async function verifyOtpCode(req: AuthenticatedRequest, res: Response) {
  const { email, otp } = req.body;
  const valid = verifyOtp(email, otp);
  if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });
  res.json({ message: "OTP verified" });
}
