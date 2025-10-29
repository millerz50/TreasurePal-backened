"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
<<<<<<< HEAD
exports.getProfile = getProfile;
=======
>>>>>>> backend-cleanup
exports.update = update;
exports.remove = remove;
exports.list = list;
exports.sendOtp = sendOtp;
exports.verifyOtpCode = verifyOtpCode;
<<<<<<< HEAD
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
=======
exports.getProfile = getProfile;
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const firebaseUpload_1 = require("../lib/firebaseUpload");
const logger_1 = require("../lib/logger");
>>>>>>> backend-cleanup
const auth_1 = require("../lib/utils/auth");
const agentService_1 = require("../services/agentService");
const otpService_1 = require("../services/otpService");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
async function login(req, res) {
    const { email, password } = req.body;
<<<<<<< HEAD
    const agent = await (0, agentService_1.getAgentByEmail)(email);
    if (!agent)
        return res.status(404).json({ error: "Agent not found" });
    const isMatch = await (0, auth_1.comparePassword)(password.trim(), agent.password);
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
async function register(req, res) {
    const agent = await (0, agentService_1.createAgent)(req.body);
    res.status(201).json(agent);
}
async function getProfile(req, res) {
    if (!req.agent || !req.agent.agentId) {
=======
    logger_1.logger.info(`Login attempt for email: ${email}`);
    try {
        const agent = await (0, agentService_1.getAgentByEmail)(email);
        if (!agent) {
            logger_1.logger.warn(`Login failed: Agent not found for email ${email}`);
            return res.status(404).json({ error: "Agent not found" });
        }
        const isMatch = await (0, auth_1.comparePassword)(password.trim(), agent.password);
        if (!isMatch) {
            logger_1.logger.warn(`Login failed: Invalid credentials for email ${email}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ agentId: agent.agentId, role: agent.role }, JWT_SECRET, { expiresIn: "2h" });
        logger_1.logger.info(`Login successful for agentId: ${agent.agentId}`);
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
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Login error for ${email}: ${message}`, err);
        res.status(500).json({ error: "Login failed", details: message });
    }
}
async function register(req, res) {
    const { firstName, surname, email } = req.body;
    logger_1.logger.info(`Registering agent: ${email}`);
    try {
        const imageBuffer = req.file?.buffer;
        const imageName = req.file?.originalname;
        if (!imageBuffer || !imageName) {
            logger_1.logger.warn(`Registration failed: Missing image for ${email}`);
            return res.status(400).json({ error: "Image file is required" });
        }
        const imageUrl = await (0, firebaseUpload_1.uploadToFirebase)(imageBuffer, imageName);
        const agent = await (0, agentService_1.createAgent)({ ...req.body, imageUrl });
        logger_1.logger.info(`Agent registered: ${agent.agentId}`);
        res.status(201).json(agent);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Agent registration failed for ${email}: ${message}`, err);
        res.status(500).json({ error: "Agent creation failed", details: message });
    }
}
async function update(req, res) {
    const agentId = req.params.agentId;
    logger_1.logger.info(`Updating agent: ${agentId}`);
    try {
        const agent = await (0, agentService_1.updateAgent)(agentId, req.body);
        logger_1.logger.info(`Agent updated: ${agentId}`);
        res.json(agent);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Update failed for agent ${agentId}: ${message}`, err);
        res.status(500).json({ error: "Update failed", details: message });
    }
}
async function remove(req, res) {
    const agentId = req.params.agentId;
    logger_1.logger.info(`Deleting agent: ${agentId}`);
    try {
        await (0, agentService_1.deleteAgent)(agentId);
        logger_1.logger.info(`Agent deleted: ${agentId}`);
        res.json({ message: "Agent deleted" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Delete failed for agent ${agentId}: ${message}`, err);
        res.status(500).json({ error: "Delete failed", details: message });
    }
}
async function list(req, res) {
    logger_1.logger.info("Fetching agent list");
    try {
        const agents = await (0, agentService_1.getAllAgents)();
        logger_1.logger.info(`Fetched ${agents.length} agents`);
        res.json(agents);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Failed to fetch agents: ${message}`, err);
        res.status(500).json({ error: "Failed to fetch agents", details: message });
    }
}
async function sendOtp(req, res) {
    const { email } = req.body;
    logger_1.logger.info(`Sending OTP to ${email}`);
    try {
        const otp = (0, otpService_1.generateOtp)(email);
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
        logger_1.logger.info(`OTP sent to ${email}`);
        res.json({ message: "OTP sent" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Failed to send OTP to ${email}: ${message}`, err);
        res.status(500).json({ error: "Failed to send OTP", details: message });
    }
}
async function verifyOtpCode(req, res) {
    const { email, otp } = req.body;
    logger_1.logger.info(`Verifying OTP for ${email}`);
    try {
        const valid = (0, otpService_1.verifyOtp)(email, otp);
        if (!valid) {
            logger_1.logger.warn(`Invalid OTP for ${email}`);
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }
        logger_1.logger.info(`OTP verified for ${email}`);
        res.json({ message: "OTP verified" });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`OTP verification failed for ${email}: ${message}`, err);
        res
            .status(500)
            .json({ error: "OTP verification failed", details: message });
    }
}
async function getProfile(req, res) {
    if (!req.agent || !req.agent.agentId) {
        logger_1.logger.warn("Unauthorized profile access attempt");
>>>>>>> backend-cleanup
        return res
            .status(401)
            .json({ error: "Unauthorized: Invalid token payload" });
    }
<<<<<<< HEAD
    // ✅ Now TypeScript knows req.agent is defined
    const agentId = req.agent.agentId;
}
async function update(req, res) {
    const agent = await (0, agentService_1.updateAgent)(req.params.agentId, req.body);
    res.json(agent);
}
async function remove(req, res) {
    await (0, agentService_1.deleteAgent)(req.params.agentId);
    res.json({ message: "Agent deleted" });
}
async function list(req, res) {
    const agents = await (0, agentService_1.getAllAgents)();
    res.json(agents);
}
async function sendOtp(req, res) {
    const { email } = req.body;
    const otp = (0, otpService_1.generateOtp)(email);
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
    res.json({ message: "OTP sent" });
}
async function verifyOtpCode(req, res) {
    const { email, otp } = req.body;
    const valid = (0, otpService_1.verifyOtp)(email, otp);
    if (!valid)
        return res.status(400).json({ error: "Invalid or expired OTP" });
    res.json({ message: "OTP verified" });
=======
    const agentId = req.agent.agentId;
    logger_1.logger.info(`Fetching profile for agentId: ${agentId}`);
    try {
        const agent = await (0, agentService_1.getAgentByEmail)(req.agent.email);
        if (!agent) {
            logger_1.logger.warn(`Profile not found for agentId: ${agentId}`);
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
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Failed to fetch profile for ${agentId}: ${message}`, err);
        res
            .status(500)
            .json({ error: "Failed to fetch profile", details: message });
    }
>>>>>>> backend-cleanup
}
