"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAgent = exports.deleteAgent = exports.updateAgent = exports.getAgentById = exports.getAgents = exports.registerAgent = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
// ✅ Register Agent
const registerAgent = async (req, res) => {
    try {
        const { password, ...rest } = req.body;
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const agent = await prisma.agent.create({
            data: {
                ...rest,
                password: hashedPassword,
            },
        });
        res.status(201).json(agent);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(400).json({ error: "Registration failed", details: message });
    }
};
exports.registerAgent = registerAgent;
// ✅ Get All Agents
const getAgents = async (_req, res) => {
    try {
        const agents = await prisma.agent.findMany();
        res.json(agents);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: "Failed to fetch agents", details: message });
    }
};
exports.getAgents = getAgents;
// ✅ Get Agent by ID
const getAgentById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const agent = await prisma.agent.findUnique({ where: { id } });
        if (!agent)
            return res.status(404).json({ error: "Agent not found" });
        res.json(agent);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(400).json({ error: "Invalid ID format", details: message });
    }
};
exports.getAgentById = getAgentById;
// ✅ Update Agent
const updateAgent = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const updated = await prisma.agent.update({
            where: { id },
            data: req.body,
        });
        res.json(updated);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(400).json({ error: "Update failed", details: message });
    }
};
exports.updateAgent = updateAgent;
// ✅ Delete Agent
const deleteAgent = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await prisma.agent.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(400).json({ error: "Invalid ID format", details: message });
    }
};
exports.deleteAgent = deleteAgent;
// ✅ Verify Agent
const verifyAgent = async (req, res) => {
    const { email } = req.body;
    const imageUrl = req.file?.path;
    if (!email || !imageUrl) {
        return res.status(400).json({ error: "Email and image are required" });
    }
    try {
        const agent = await prisma.agent.updateMany({
            where: { email },
            data: {
                imageUrl,
                emailVerified: true,
                status: "Verified",
            },
        });
        if (agent.count === 0) {
            return res.status(404).json({ error: "Agent not found" });
        }
        const updated = await prisma.agent.findUnique({ where: { email } });
        res.json({ message: "Agent verified successfully", agent: updated });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        res.status(500).json({ error: "Verification failed", details: message });
    }
};
exports.verifyAgent = verifyAgent;
