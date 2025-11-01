"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_appwrite_1 = require("node-appwrite");
const verifyToken_1 = require("../middleware/verifyToken");
const dashboard_1 = require("../services/dashboard");
const router = express_1.default.Router();
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "TreasurePal";
const AGENTS_COLLECTION = "agents";
const METRICS_COLLECTION = "agentMetricRecords";
router.get("/metrics", verifyToken_1.verifyToken, async (req, res, next) => {
    try {
        const { agent } = req;
        if (!agent || !agent.id || !agent.token) {
            return next(new Error("Invalid token payload"));
        }
        // 🔍 Check if agent exists
        const result = await databases.listDocuments(DB_ID, AGENTS_COLLECTION, [
            node_appwrite_1.Query.equal("$id", agent.id),
        ]);
        if (result.total === 0) {
            return res.status(404).json({ error: "Agent not found" });
        }
        // 📊 Generate metrics
        const metrics = await (0, dashboard_1.getAgentDashboardMetrics)(agent.id);
        // 📝 Record metrics
        await databases.createDocument(DB_ID, METRICS_COLLECTION, "unique()", {
            agentId: agent.id,
            metrics,
            recordedAt: new Date().toISOString(),
        });
        res.status(200).json({ agent, metrics });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
