"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const verifyToken_1 = require("../middleware/verifyToken");
const dashboard_1 = require("../services/dashboard");
const router = express_1.default.Router();
router.get("/metrics", verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        const { agent } = req;
        if (!agent || !agent.id || !agent.token) {
            return next(new Error("Invalid token payload"));
        }
        const audit = await prisma_1.prisma.agent.findUnique({
            where: { id: agent.id },
        });
        if (!audit) {
            return res.status(404).json({ error: "Agent not found" });
        }
        const metrics = await (0, dashboard_1.getAgentDashboardMetrics)(agent.id);
        await prisma_1.prisma.agentMetricRecord.create({
            data: {
                agentId: agent.id,
                metrics,
            },
        });
        res.status(200).json({ agent, metrics });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
