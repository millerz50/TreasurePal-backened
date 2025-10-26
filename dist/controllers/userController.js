"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.editUser = exports.getUserProfile = exports.loginUser = exports.signup = exports.getAllUsers = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const hashPassword_js_1 = require("../utils/hashPassword.js");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                userId: true,
                name: true,
                surname: true,
                email: true,
                avatarUrl: true,
                occupation: true,
                status: true,
                createdAt: true,
            },
        });
        return res.json({ users });
    }
    catch (err) {
        console.error("❌ Fetch all users error:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
//
// 🔐 Signup
//
const signup = async (req, res) => {
    try {
        const { name, surname, email, password, dob, occupation, avatarUrl } = req.body;
        if (!name || !surname || !email || !password || !dob || !occupation) {
            return res.status(400).json({
                error: "Missing required fields",
                fields: { name, surname, email, password, dob, occupation },
            });
        }
        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existing) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const user = await prisma.user.create({
            data: {
                userId: (0, nanoid_1.nanoid)(12),
                name,
                surname,
                email: email.toLowerCase(),
                password: await (0, hashPassword_js_1.hashPassword)(password),
                dob: new Date(dob),
                occupation,
                status: "active",
                avatarUrl: avatarUrl || "/avatars/default.png",
            },
        });
        return res.status(201).json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        console.error("❌ Signup error:", err);
        return res.status(500).json({
            error: "Internal server error",
            details: err instanceof Error ? err.message : String(err),
        });
    }
};
exports.signup = signup;
//
// 🔐 Login
//
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ only true in prod
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // ✅ lax works locally
        });
        return res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        console.error("❌ Login error:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
//
// 🔐 SSR-compatible profile fetch
//
const getUserProfile = async (req, res) => {
    try {
        const userId = req.agent?.id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                avatarUrl: true,
                userId: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ user });
    }
    catch (err) {
        console.error("❌ Profile fetch error:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getUserProfile = getUserProfile;
//
// ✏️ Edit user
//
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (!id) {
            return res.status(400).json({ error: "Missing user ID" });
        }
        if (updates.password) {
            updates.password = await (0, hashPassword_js_1.hashPassword)(updates.password);
        }
        const user = await prisma.user.update({
            where: { id },
            data: updates,
        });
        return res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        console.error("❌ Edit error:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.editUser = editUser;
//
// 🗑️ Delete user
//
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Missing user ID" });
        }
        await prisma.user.delete({ where: { id } });
        return res.status(204).send();
    }
    catch (err) {
        console.error("❌ Delete error:", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
