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
const logger_1 = require("../lib/logger");
const hashPassword_js_1 = require("../utils/hashPassword.js");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
//
// 📋 Get all users
//
const getAllUsers = async (req, res) => {
    logger_1.logger.info("Fetching all users");
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
        logger_1.logger.info(`Fetched ${users.length} users`);
        return res.json({ users });
    }
    catch (err) {
        logger_1.logger.error(`Fetch all users error: ${err.message}`, err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
//
// 🔐 Signup
//
const signup = async (req, res) => {
    const { name, surname, email, password, dob, occupation, avatarUrl } = req.body;
    logger_1.logger.info(`Signup attempt for email: ${email}`);
    try {
        if (!name || !surname || !email || !password || !dob || !occupation) {
            logger_1.logger.warn(`Signup failed: Missing fields for ${email}`);
            return res.status(400).json({
                error: "Missing required fields",
                fields: { name, surname, email, password, dob, occupation },
            });
        }
        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existing) {
            logger_1.logger.warn(`Signup failed: Email already registered - ${email}`);
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
        logger_1.logger.info(`User created: ${user.userId}`);
        return res.status(201).json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        logger_1.logger.error(`Signup error for ${email}: ${err.message}`, err);
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
    const { email, password } = req.body;
    logger_1.logger.info(`Login attempt for email: ${email}`);
    try {
        if (!email || !password) {
            logger_1.logger.warn("Login failed: Missing email or password");
            return res.status(400).json({ error: "Email and password required" });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            logger_1.logger.warn(`Login failed: Invalid credentials for ${email}`);
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        logger_1.logger.info(`Login successful for userId: ${user.userId}`);
        return res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        logger_1.logger.error(`Login error for ${email}: ${err.message}`, err);
        return res.status(500).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
//
// 🔐 SSR-compatible profile fetch
//
const getUserProfile = async (req, res) => {
    const userId = req.agent?.id;
    logger_1.logger.info(`Fetching profile for userId: ${userId}`);
    try {
        if (!userId) {
            logger_1.logger.warn("Unauthorized profile access attempt");
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
            logger_1.logger.warn(`Profile not found for userId: ${userId}`);
            return res.status(404).json({ error: "User not found" });
        }
        logger_1.logger.info(`Profile fetched for userId: ${userId}`);
        return res.json({ user });
    }
    catch (err) {
        logger_1.logger.error(`Profile fetch error for ${userId}: ${err.message}`, err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getUserProfile = getUserProfile;
//
// ✏️ Edit user
//
const editUser = async (req, res) => {
    const { id } = req.params;
    logger_1.logger.info(`Editing user: ${id}`);
    try {
        const updates = { ...req.body };
        if (!id) {
            logger_1.logger.warn("Edit failed: Missing user ID");
            return res.status(400).json({ error: "Missing user ID" });
        }
        if (updates.password) {
            updates.password = await (0, hashPassword_js_1.hashPassword)(updates.password);
        }
        const user = await prisma.user.update({
            where: { id },
            data: updates,
        });
        logger_1.logger.info(`User updated: ${user.userId}`);
        return res.json({
            user: {
                name: user.name,
                avatarUrl: user.avatarUrl,
                userId: user.userId,
            },
        });
    }
    catch (err) {
        logger_1.logger.error(`Edit error for user ${id}: ${err.message}`, err);
        return res.status(500).json({ error: err.message });
    }
};
exports.editUser = editUser;
//
// 🗑️ Delete user
//
const deleteUser = async (req, res) => {
    const { id } = req.params;
    logger_1.logger.info(`Deleting user: ${id}`);
    try {
        if (!id) {
            logger_1.logger.warn("Delete failed: Missing user ID");
            return res.status(400).json({ error: "Missing user ID" });
        }
        await prisma.user.delete({ where: { id } });
        logger_1.logger.info(`User deleted: ${id}`);
        return res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Delete error for user ${id}: ${err.message}`, err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
