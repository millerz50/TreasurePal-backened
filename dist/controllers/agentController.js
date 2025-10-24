"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.getProfile = getProfile;
exports.update = update;
exports.remove = remove;
exports.list = list;
exports.sendOtp = sendOtp;
exports.verifyOtpCode = verifyOtpCode;
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const auth_1 = require("../lib/utils/auth");
const agentService_1 = require("../services/agentService");
const otpService_1 = require("../services/otpService");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
async function login(req, res) {
    const { email, password } = req.body;
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
        return res
            .status(401)
            .json({ error: "Unauthorized: Invalid token payload" });
    }
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
}
