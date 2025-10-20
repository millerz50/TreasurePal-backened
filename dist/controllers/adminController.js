"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.deleteAgent = exports.deleteUser = exports.createAdmin = exports.approveBlogPost = void 0;
const client_1 = require("@prisma/client");
const hashPassword_js_1 = require("../utils/hashPassword.js"); // ✅ Ensure this exists and is compiled
const prisma = new client_1.PrismaClient();
// ✅ Approve a blog post
const approveBlogPost = async (req, res) => {
    try {
        const { postId, adminId } = req.body;
        const post = await prisma.blogPost.update({
            where: { id: postId },
            data: {
                approvedByAdminId: adminId,
                published: true,
            },
        });
        res.json({ post });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.approveBlogPost = approveBlogPost;
// ✅ Create a new admin
const createAdmin = async (req, res) => {
    try {
        const { firstName, surname, email, password } = req.body;
        if (!firstName || !surname || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const normalizedEmail = email.toLowerCase();
        const existing = await prisma.admin.findUnique({
            where: { email: normalizedEmail },
        });
        if (existing) {
            res.status(409).json({ error: "Admin already exists" });
            return;
        }
        const hashedPassword = await (0, hashPassword_js_1.hashPassword)(password);
        const admin = await prisma.admin.create({
            data: {
                firstName,
                surname,
                email: normalizedEmail,
                password: hashedPassword,
                role: "admin",
                status: "active",
                emailVerified: false,
            },
        });
        res.status(201).json({ admin });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createAdmin = createAdmin;
// ✅ Delete a user
const deleteUser = async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUser = deleteUser;
// ✅ Delete an agent
const deleteAgent = async (req, res) => {
    try {
        await prisma.agent.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAgent = deleteAgent;
// ✅ Delete a property
const deleteProperty = async (req, res) => {
    try {
        await prisma.property.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteProperty = deleteProperty;
