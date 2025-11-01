"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.approveBlogPost = exports.deleteUser = exports.editUser = exports.getUserProfile = exports.loginUser = exports.signup = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
const node_appwrite_1 = require("node-appwrite");
const logger_1 = require("../lib/logger");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const account = new node_appwrite_1.Account(client);
const databases = new node_appwrite_1.Databases(client);
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const DB_ID = "main-db";
const USERS_COLLECTION = "users";
//
// 📋 Get all users (admin only)
//
const getAllUsers = async (req, res) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ error: "Only admins can view all users." });
    }
    try {
        const users = await databases.listDocuments(DB_ID, USERS_COLLECTION);
        return res.json({ users: users.documents });
    }
    catch (err) {
        logger_1.logger.error("Error fetching users", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getAllUsers = getAllUsers;
//
// 🔐 Signup (admin-only for role=admin)
//
const signup = async (req, res) => {
    const { name, surname, email, password, dob, occupation, avatarUrl, role = "user", nationalId, agentCode, imageUrl, } = req.body;
    try {
        if (!name || !surname || !email || !password || !dob || !occupation) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        if (role === "admin" && req.user?.role !== "admin") {
            return res
                .status(403)
                .json({ error: "Only admins can create other admins." });
        }
        const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
            node_appwrite_1.Query.equal("email", email.toLowerCase()),
        ]);
        if (existing.total > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        const userId = (0, nanoid_1.nanoid)(12);
        const user = await databases.createDocument(DB_ID, USERS_COLLECTION, "unique()", {
            userId,
            name,
            surname,
            email: email.toLowerCase(),
            password: hashed,
            dob,
            occupation,
            status: "active",
            role,
            avatarUrl: avatarUrl || "/avatars/default.png",
            nationalId,
            agentCode,
            imageUrl,
            emailVerified: false,
            blogLikes: [],
            propertyLikes: [],
        }, [
            node_appwrite_1.Permission.read(node_appwrite_1.Role.user(req.user?.id || "admin")),
            node_appwrite_1.Permission.write(node_appwrite_1.Role.user(req.user?.id || "admin")),
        ]);
        return res.status(201).json({ user });
    }
    catch (err) {
        logger_1.logger.error("Signup error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.signup = signup;
//
// 🔐 Login
//
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
            node_appwrite_1.Query.equal("email", email.toLowerCase()),
        ]);
        const user = result.documents[0];
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.$id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        return res.json({ user });
    }
    catch (err) {
        logger_1.logger.error("Login error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
//
// 🔍 Get profile
//
const getUserProfile = async (req, res) => {
    try {
        const user = await databases.getDocument(DB_ID, USERS_COLLECTION, req.user?.id);
        return res.json({ user });
    }
    catch (err) {
        logger_1.logger.error("Profile fetch error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.getUserProfile = getUserProfile;
//
// ✏️ Edit user (self or admin)
//
const editUser = async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    try {
        if (req.user?.id !== id && req.user?.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized to edit this user." });
        }
        if (updates.password) {
            updates.password = await bcrypt_1.default.hash(updates.password, 10);
        }
        const user = await databases.updateDocument(DB_ID, USERS_COLLECTION, id, updates);
        return res.json({ user });
    }
    catch (err) {
        logger_1.logger.error("Edit error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.editUser = editUser;
//
// 🗑️ Delete user (admin only)
//
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({ error: "Only admins can delete users." });
        }
        await databases.deleteDocument(DB_ID, USERS_COLLECTION, id);
        return res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error("Delete error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
const approveBlogPost = async (req, res) => {
    const { postId } = req.body;
    if (req.user?.role !== "admin") {
        return res
            .status(403)
            .json({ error: "Only admins can approve blog posts." });
    }
    try {
        const updated = await databases.updateDocument("main-db", "blogposts", postId, {
            status: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: req.user.id,
        });
        return res.json({ post: updated });
    }
    catch (err) {
        logger_1.logger.error("Blog approval error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.approveBlogPost = approveBlogPost;
const deleteProperty = async (req, res) => {
    const { id } = req.params;
    if (req.user?.role !== "admin") {
        return res
            .status(403)
            .json({ error: "Only admins can delete properties." });
    }
    try {
        await databases.deleteDocument("main-db", "properties", id);
        return res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error("Property delete error", err);
        return res.status(500).json({ error: err.message });
    }
};
exports.deleteProperty = deleteProperty;
