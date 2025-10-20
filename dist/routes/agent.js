"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cookie_1 = __importDefault(require("cookie"));
const express_1 = __importDefault(require("express"));
const storage_1 = require("firebase/storage");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = __importDefault(require("multer"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const firebase_1 = require("../lib/firebase");
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// 🖼️ Multer setup
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});
// 🧬 Agent ID Generator
const generateAgentId = () => {
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
        const isMatch = await bcrypt_1.default.compare(password.trim(), agent.password);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ agentId: agent.agentId, role: agent.role }, JWT_SECRET, { expiresIn: "2h" });
        res.setHeader("Set-Cookie", cookie_1.default.serialize("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 2 * 60 * 60,
            path: "/",
        }));
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
    catch (err) {
        res.status(500).json({ error: "Server error", details: String(err) });
    }
});
// 🧪 Debug Registration
router.post("/debug/register", async (req, res) => {
    try {
        const { email, password, ...rest } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const agent = await prisma.agent.create({
            data: {
                ...rest,
                email,
                password: hashedPassword,
                agentId: generateAgentId(),
            },
        });
        res.status(201).json({
            message: "Debug registration successful",
            agent: {
                email: agent.email,
                agentId: agent.agentId,
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
router.get("/me", auth_js_1.verifyToken, async (req, res) => {
    const payload = req.agent;
    if (typeof payload === "object" && "agentId" in payload) {
        const { agentId } = payload;
        try {
            const agent = await prisma.agent.findUnique({ where: { agentId } });
            if (!agent)
                return res.status(404).json({ error: "Agent not found" });
            res.status(200).json({
                agent: {
                    email: agent.email,
                    agentId: agent.agentId,
                    role: agent.role,
                    status: agent.status,
                },
            });
        }
        catch (err) {
            res.status(500).json({ error: "Server error", details: String(err) });
        }
    }
    else {
        res.status(403).json({ error: "Invalid or missing token payload" });
    }
});
// 🆕 Create Agent with Firebase Image Upload
router.post("/create", upload.single("image"), async (req, res) => {
    console.log("🚀 /create route hit");
    console.log("🧾 req.body:", req.body);
    console.log("🖼️ req.file:", req.file);
    try {
        const { firstName, surname, email, nationalId, password, status } = req.body;
        const existing = await prisma.agent.findUnique({ where: { email } });
        if (existing)
            return res.status(409).json({ error: "Email already in use" });
        let imageUrl = null;
        if (req.file) {
            const imageRef = (0, storage_1.ref)(firebase_1.storage, `agents/${Date.now()}_${req.file.originalname}`);
            const snapshot = await (0, storage_1.uploadBytes)(imageRef, req.file.buffer);
            imageUrl = await (0, storage_1.getDownloadURL)(snapshot.ref);
        }
        if (!firstName || !surname || !email || !nationalId || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const newAgent = await prisma.agent.create({
            data: {
                firstName,
                surname,
                email,
                nationalId,
                password: await bcrypt_1.default.hash(password, 10),
                status,
                agentId: generateAgentId(),
                imageUrl,
            },
        });
        res.status(201).json({
            message: "Agent created",
            agent: {
                email: newAgent.email,
                agentId: newAgent.agentId,
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
router.put("/update/:agentId", async (req, res) => {
    try {
        const { agentId } = req.params;
        const updates = req.body;
        const agent = await prisma.agent.update({
            where: { agentId },
            data: updates,
        });
        res.status(200).json({
            message: "Agent updated",
            agent: {
                email: agent.email,
                agentId: agent.agentId,
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
router.delete("/delete/:agentId", async (req, res) => {
    try {
        const { agentId } = req.params;
        await prisma.agent.delete({ where: { agentId } });
        res.status(200).json({ message: "Agent deleted", agentId });
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
        const transporter = nodemailer_1.default.createTransport({
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
        res
            .status(500)
            .json({ error: "Failed to send OTP via email.", details: String(err) });
    }
});
// ✅ Verify OTP
router.post("/otp/verify", async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);
    if (!record) {
        return res.status(400).json({ error: "No OTP found for this email." });
    }
    if (Date.now() > record.expires) {
        otpStore.delete(email);
        return res.status(400).json({ error: "OTP has expired." });
    }
    if (record.otp !== otp) {
        return res.status(401).json({ error: "Invalid OTP." });
    }
    otpStore.delete(email);
    otpStore.delete(email);
    res.status(200).json({ message: "OTP verified successfully." });
});
exports.default = router;
