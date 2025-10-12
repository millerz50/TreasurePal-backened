import bcrypt from "bcrypt";
import cookie from "cookie";
import express from "express";
import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import multer from "multer";
import nodemailer from "nodemailer";
import { AuthenticatedRequest, verifyToken } from "../middleware/auth.js";
import Agent from "../models/Agent.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🖼️ Image Upload (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 🧬 User ID Generator
const generateUserId = (): string => {
  const prefix = "AG";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numericPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomPart}-${numericPart}`;
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📨 Incoming login request:", { email, password });

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    console.log(
      "🔍 Char codes:",
      [...password].map((c) => c.charCodeAt(0))
    );

    const agent = await Agent.findOne({ email }).select("+password");

    if (!agent) {
      console.log("❌ Agent not found:", email);
      return res.status(404).json({ error: "Agent not found" });
    }

    console.log("🔐 Stored hash:", agent.password);

    const isMatch = await bcrypt.compare(password.trim(), agent.password);
    console.log("✅ Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Invalid password for:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { userId: agent.userId, role: agent.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // ✅ Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 2 * 60 * 60,
        path: "/",
      })
    );

    console.log("✅ Login successful for:", email);
    return res.status(200).json({
      message: "Login successful",
      agent: {
        email: agent.email,
        userId: agent.userId,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: "Server error", details: message });
  }
});

// 🧩 Debug Registration Route (moved OUTSIDE login)
router.post("/debug/register", async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = new Agent({ ...rest, email, password: hashedPassword });
    await agent.save();

    console.log("✅ Registered agent:", agent.email);
    console.log("🔐 Stored password hash:", agent.password);

    res.status(201).json({
      message: "Debug registration successful",
      agent: {
        email: agent.email,
        userId: agent.userId,
        passwordHash: agent.password,
        isHashed: agent.password.startsWith("$2b$"),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Debug registration failed:", message);
    res
      .status(400)
      .json({ error: "Debug registration failed", details: message });
  }
});

// 🙋‍♂️ Get Authenticated Agent
router.get("/me", verifyToken, async (req: AuthenticatedRequest, res) => {
  if (!req.agent || typeof req.agent !== "object" || !("userId" in req.agent)) {
    return res.status(403).json({ error: "Invalid or missing token payload" });
  }

  const { userId } = req.agent as JwtPayload;

  try {
    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.status(200).json({
      agent: {
        email: agent.email,
        userId: agent.userId,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (err) {
    console.error("❌ /me error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Server error", details: message });
  }
});
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { firstName, surname, email, nationalId, password, status } =
      req.body;

    const existing = await Agent.findOne({ email });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const newAgent = new Agent({
      firstName,
      surname,
      email,
      nationalId,
      password, // ✅ raw password only
      status,
      userId: generateUserId(),
      imageUrl: req.file ? req.file.originalname : undefined,
    });

    await newAgent.save(); // ✅ schema will hash it once

    res.status(201).json({
      message: "Agent created",
      agent: {
        email: newAgent.email,
        userId: newAgent.userId,
        role: newAgent.role,
        status: newAgent.status,
        imageUrl: newAgent.imageUrl,
      },
    });
  } catch (err) {
    console.error("❌ Agent creation failed:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ message: "Validation error", error: message });
  }
});

// ✏️ Update Agent
router.put("/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const agent = await Agent.findOneAndUpdate({ userId }, updates, {
      new: true,
      runValidators: true,
    });

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.status(200).json({
      message: "Agent updated",
      agent: {
        email: agent.email,
        userId: agent.userId,
        role: agent.role,
        status: agent.status,
      },
    });
  } catch (err) {
    console.error("❌ Update error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "Update failed", details: message });
  }
});

// 🗑️ Delete Agent
router.delete("/delete/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const agent = await Agent.findOneAndDelete({ userId });

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.status(200).json({ message: "Agent deleted", userId });
  } catch (err) {
    console.error("❌ Deletion error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Deletion failed", details: message });
  }
});

// 📋 Get All Agents
router.get("/all", async (_req, res) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err) {
    console.error("❌ Fetch all error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ message: "Server error", error: message });
  }
});

// ✉️ Send OTP
const otpStore = new Map(); // Replace with DB in production

router.post("/otp/send", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 });

  try {
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

    res.status(200).json({ message: "OTP sent via email." });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send OTP via email." });
  }
});

export default router;
