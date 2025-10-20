"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.editUser = exports.getUserProfile = exports.loginUser = exports.signup = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const hashPassword_js_1 = require("../utils/hashPassword.js");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
// 🔐 Signup
const signup = async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: {
                userId: (0, nanoid_1.nanoid)(12),
                ...req.body,
                email: req.body.email.toLowerCase(),
                password: await (0, hashPassword_js_1.hashPassword)(req.body.password),
                avatarUrl: req.body.avatarUrl || "/avatars/default.png",
            },
        });
        res.status(201).json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.signup = signup;
// 🔐 Login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
        });
        res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
// 🔐 SSR-compatible profile fetch
const getUserProfile = async (req, res) => {
    try {
        const userId = req.agent.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                avatarUrl: true,
                userId: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getUserProfile = getUserProfile;
// ✏️ Edit user
const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await (0, hashPassword_js_1.hashPassword)(updates.password);
        }
        const user = await prisma.user.update({
            where: { id },
            data: updates,
        });
        res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.editUser = editUser;
// 🗑️ Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
