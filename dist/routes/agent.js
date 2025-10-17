import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import cookie from "cookie";
import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import nodemailer from "nodemailer";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// 🖼️ Image Upload (in-memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });
// 🧬 User ID Generator
const generateUserId = () => {
    const prefix = "AG";
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const numericPart = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomPart}-${numericPart}`;
};
// 🔐 Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }
        const agent = await prisma.agent.findUnique({ where: { email } });
        if (!agent)
            return res.status(404).json({ error: "Agent not found" });
        const isMatch = await bcrypt.compare(password.trim(), agent.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign({ userId: agent.userId, role: agent.role }, JWT_SECRET, { expiresIn: "2h" });
        res.setHeader("Set-Cookie", cookie.serialize("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 2 * 60 * 60,
            path: "/",
        }));
        res.status(200).json({
            message: "Login successful",
            agent: {
                email: agent.email,
                userId: agent.userId,
                role: agent.role,
                status: agent.status,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: String(err) });
    }
});
// 🧪 Debug Registration
router.post("/debug/register", async (req, res) => {
    try {
        const { email, password, ...rest } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const agent = await prisma.agent.create({
            data: {
                ...rest,
                email,
                password: hashedPassword,
                userId: generateUserId(),
            },
        });
        res.status(201).json({
            message: "Debug registration successful",
            agent: {
                email: agent.email,
                userId: agent.userId,
                passwordHash: agent.password,
                isHashed: agent.password.startsWith("$2b$"),
            },
        });
    }
    catch (err) {
        res
            .status(400)
            .json({ error: "Debug registration failed", details: String(err) });
    }
});
// 👤 Get Authenticated Agent
router.get("/me", verifyToken, async (req, res) => {
    const payload = req.agent;
    if (!payload ||
        typeof payload !== "object" ||
        !("userId" in payload) ||
        typeof payload.userId !== "string") {
        return res.status(403).json({ error: "Invalid or missing token payload" });
    }
    const { userId } = payload;
    try {
        const agent = await prisma.agent.findUnique({ where: { userId } });
        if (!agent)
            return res.status(404).json({ error: "Agent not found" });
        res.status(200).json({
            agent: {
                email: agent.email,
                userId: agent.userId,
                role: agent.role,
                status: agent.status,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Server error", details: String(err) });
    }
});
// 🆕 Create Agent
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const { firstName, surname, email, nationalId, password, status } = req.body;
        const existing = await prisma.agent.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ error: "Email already in use" });
        const newAgent = await prisma.agent.create({
            data: {
                firstName,
                surname,
                email,
                nationalId,
                password: await bcrypt.hash(password, 10),
                status,
                userId: generateUserId(),
                imageUrl: req.file?.originalname,
            },
        });
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
    }
    catch (err) {
        res.status(400).json({ message: "Validation error", error: String(err) });
    }
});
// ✏️ Update Agent
router.put("/update/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        const agent = await prisma.agent.update({
            where: { userId },
            data: updates,
        });
        res.status(200).json({
            message: "Agent updated",
            agent: {
                email: agent.email,
                userId: agent.userId,
                role: agent.role,
                status: agent.status,
            },
        });
    }
    catch (err) {
        res.status(400).json({ error: "Update failed", details: String(err) });
    }
});
// 🗑️ Delete Agent
router.delete("/delete/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        await prisma.agent.delete({ where: { userId } });
        res.status(200).json({ message: "Agent deleted", userId });
    }
    catch (err) {
        res.status(500).json({ error: "Deletion failed", details: String(err) });
    }
});
// 📋 Get All Agents
router.get("/all", async (_req, res) => {
    try {
        const agents = await prisma.agent.findMany();
        res.json(agents);
    }
    catch (err) {
        res.status(500).json({ message: "Server error", error: String(err) });
    }
});
// ✉️ Send OTP
const otpStore = new Map();
router.post("/otp/send", async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: "Email is required." });
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
    }
    catch (err) {
        res.status(500).json({ error: "Failed to send OTP via email." });
    }
});
export default router;
