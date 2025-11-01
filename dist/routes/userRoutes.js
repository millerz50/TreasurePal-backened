"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const adminService_1 = require("../services/adminService");
const agentService_1 = require("../services/agentService");
const verifyToken_1 = require("../middleware/verifyToken");
const verifyTokenAndAdmin_1 = require("../middleware/verifyTokenAndAdmin");
const router = (0, express_1.Router)();
// 🔓 Public routes
router.post("/signup", userController_1.signup);
router.post("/login", userController_1.loginUser);
// 🔐 Authenticated user routes
router.get("/me", verifyToken_1.verifyToken, userController_1.getUserProfile);
router.put("/:id", verifyToken_1.verifyToken, userController_1.editUser);
router.delete("/:id", verifyToken_1.verifyToken, userController_1.deleteUser);
router.get("/all", verifyToken_1.verifyToken, userController_1.getAllUsers);
// 🛡️ Admin-only routes
router.post("/admin/signup", verifyTokenAndAdmin_1.verifyTokenAndAdmin, async (req, res) => {
    try {
        const admin = await (0, adminService_1.createAdminAccount)(req.body);
        res.status(201).json(admin);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/approve-blog", verifyTokenAndAdmin_1.verifyTokenAndAdmin, async (req, res) => {
    try {
        const { postId } = req.body;
        if (!req.user?.id) {
            throw new Error("Missing authenticated user ID");
        }
        const result = await (0, adminService_1.approveBlog)(postId, req.user.id);
        res.json(result);
    }
    catch (err) {
        res.status(403).json({ error: err.message });
    }
});
router.delete("/property/:id", verifyTokenAndAdmin_1.verifyTokenAndAdmin, async (req, res) => {
    try {
        await (0, adminService_1.removeProperty)(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete("/user/:id", verifyTokenAndAdmin_1.verifyTokenAndAdmin, async (req, res) => {
    try {
        await (0, adminService_1.removeUser)(req.params.id);
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 🧭 Agent routes
router.post("/agent/signup", async (req, res) => {
    try {
        const agent = await (0, agentService_1.createAgent)(req.body);
        res.status(201).json(agent);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.put("/agent/:agentId", verifyToken_1.verifyToken, async (req, res) => {
    try {
        const updated = await (0, agentService_1.updateAgent)(req.params.agentId, req.body);
        res.json(updated);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.delete("/agent/:agentId", verifyToken_1.verifyToken, async (req, res) => {
    try {
        await (0, agentService_1.deleteAgent)(req.params.agentId);
        res.status(204).send();
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.get("/agent/email/:email", verifyToken_1.verifyToken, async (req, res) => {
    try {
        const agent = await (0, agentService_1.getAgentByEmail)(req.params.email);
        res.json(agent);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.get("/agent/id/:agentId", verifyToken_1.verifyToken, async (req, res) => {
    try {
        const agent = await (0, agentService_1.getAgentById)(req.params.agentId);
        res.json(agent);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
router.get("/agents", verifyToken_1.verifyToken, async (_req, res) => {
    try {
        const agents = await (0, agentService_1.getAllAgents)();
        res.json(agents);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
