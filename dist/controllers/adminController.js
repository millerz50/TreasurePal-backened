"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePropertyById = exports.deleteAgentById = exports.deleteUserById = exports.createAdmin = exports.approveBlogPost = void 0;
const logger_1 = require("../lib/logger");
const adminService_1 = require("../services/adminService");
//
// ✅ Approve blog post
//
const approveBlogPost = async (req, res) => {
    const { postId, adminId } = req.body;
    logger_1.logger.info(`Admin ${adminId} attempting to approve blog post ${postId}`);
    try {
        const post = await (0, adminService_1.approveBlog)(postId, adminId);
        logger_1.logger.info(`Blog post ${postId} approved by admin ${adminId}`);
        res.json({ post });
    }
    catch (err) {
        logger_1.logger.error(`Failed to approve blog post ${postId}: ${err.message}`, err);
        res.status(500).json({ error: err.message });
    }
};
exports.approveBlogPost = approveBlogPost;
//
// ✅ Create admin account
//
const createAdmin = async (req, res) => {
    const { firstName, surname, email, password } = req.body;
    logger_1.logger.info(`Creating admin account for ${email}`);
    try {
        if (!firstName || !surname || !email || !password) {
            logger_1.logger.warn(`Admin creation failed: Missing fields for ${email}`);
            res.status(400).json({ error: "All fields are required" });
            return;
        }
        const admin = await (0, adminService_1.createAdminAccount)({
            firstName,
            surname,
            email,
            password,
        });
        logger_1.logger.info(`Admin account created: ${admin.id}`);
        res.status(201).json({ admin });
    }
    catch (err) {
        logger_1.logger.error(`Admin creation failed for ${email}: ${err.message}`, err);
        res.status(500).json({ error: err.message });
    }
};
exports.createAdmin = createAdmin;
//
// ✅ Delete user
//
const deleteUserById = async (req, res) => {
    const userId = req.params.id;
    logger_1.logger.info(`Deleting user: ${userId}`);
    try {
        await (0, adminService_1.removeUser)(userId);
        logger_1.logger.info(`User deleted: ${userId}`);
        res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Failed to delete user ${userId}: ${err.message}`, err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteUserById = deleteUserById;
//
// ✅ Delete agent
//
const deleteAgentById = async (req, res) => {
    const agentId = parseInt(req.params.id);
    logger_1.logger.info(`Deleting agent: ${agentId}`);
    try {
        await (0, adminService_1.removeAgent)(agentId);
        logger_1.logger.info(`Agent deleted: ${agentId}`);
        res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Failed to delete agent ${agentId}: ${err.message}`, err);
        res.status(500).json({ error: err.message });
    }
};
exports.deleteAgentById = deleteAgentById;
//
// ✅ Delete property
//
const deletePropertyById = async (req, res) => {
    const propertyId = parseInt(req.params.id);
    logger_1.logger.info(`Deleting property: ${propertyId}`);
    try {
        await (0, adminService_1.removeProperty)(propertyId);
        logger_1.logger.info(`Property deleted: ${propertyId}`);
        res.status(204).send();
    }
    catch (err) {
        logger_1.logger.error(`Failed to delete property ${propertyId}: ${err.message}`, err);
        res.status(500).json({ error: err.message });
    }
};
exports.deletePropertyById = deletePropertyById;
