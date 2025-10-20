"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/", auth_js_1.verifyToken, async (req, res) => {
    try {
        const payload = req.agent;
        if (!payload ||
            typeof payload !== "object" ||
            typeof payload.agentId !== "string") {
            return res.status(401).json({ error: "Invalid token payload" });
        }
        const { agentId } = payload;
        const agent = await prisma.agent.findUnique({
            where: { agentId },
        });
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        const totalListings = await prisma.property.count({
            where: { agentId },
        });
        const activeAgents = await prisma.agent.count({
            where: { status: "Verified" },
        });
        const viewsThisWeekAgg = await prisma.property.aggregate({
            _sum: { viewsThisWeek: true },
            where: { agentId },
        });
        const recentActivity = await prisma.property.findMany({
            where: { agentId },
            orderBy: { createdAt: "desc" },
            take: 3,
            select: { title: true, createdAt: true },
        });
        const activityFeed = recentActivity.map((listing) => ({
            type: "listing",
            message: `New listing added: “${listing.title}”`,
        }));
        const metrics = {
            totalListings,
            activeAgents,
            viewsThisWeek: viewsThisWeekAgg._sum.viewsThisWeek || 0,
            recentActivity: activityFeed,
        };
        res.status(200).json({ agent, metrics });
    }
    catch (err) {
        res.status(500).json({
            error: "Dashboard fetch failed",
            details: String(err),
        });
    }
});
exports.default = router;
