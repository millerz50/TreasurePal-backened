"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePropertyById = exports.deleteAgentById = exports.deleteUserById = exports.createAdmin = exports.approveBlogPost = void 0;
const adminService_1 = require("../services/adminService");
const approveBlogPost = async (req, res) => {
    try {
        const { postId, adminId } = req.body;
        const post = await (0, adminService_1.approveBlog)(postId, adminId);
        res.json({ post });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.approveBlogPost = approveBlogPost;
const createAdmin = async (req, res) => {
    try {
        const { firstName, surname, email, password } = req.body;
        if (!firstName || !surname || !email || !password) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const admin = await (0, adminService_1.createAdminAccount)({
            firstName,
            surname,
            email,
            password,
        });
        res.status(201).json({ admin });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createAdmin = createAdmin;
const deleteUserById = async (req, res) => {
    try {
        await (0, adminService_1.removeUser)(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUserById = deleteUserById;
const deleteAgentById = async (req, res) => {
    try {
        await (0, adminService_1.removeAgent)(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAgentById = deleteAgentById;
const deletePropertyById = async (req, res) => {
    try {
        await (0, adminService_1.removeProperty)(parseInt(req.params.id));
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deletePropertyById = deletePropertyById;
