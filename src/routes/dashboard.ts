import express, { NextFunction, Response } from "express";
import { Client, Databases, Query } from "node-appwrite";
import { verifyToken } from "../middleware/verifyToken";
import { getAgentDashboardMetrics } from "../services/dashboard";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const router = express.Router();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "TreasurePal";
const AGENTS_COLLECTION = "agents";
const METRICS_COLLECTION = "agentMetricRecords";

router.get(
  "/metrics",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { agent } = req;

      if (!agent || !agent.id || !agent.token) {
        return next(new Error("Invalid token payload"));
      }

      // 🔍 Check if agent exists
      const result = await databases.listDocuments(DB_ID, AGENTS_COLLECTION, [
        Query.equal("$id", agent.id),
      ]);

      if (result.total === 0) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // 📊 Generate metrics
      const metrics = await getAgentDashboardMetrics(agent.id);

      // 📝 Record metrics
      await databases.createDocument(DB_ID, METRICS_COLLECTION, "unique()", {
        agentId: agent.id,
        metrics,
        recordedAt: new Date().toISOString(),
      });

      res.status(200).json({ agent, metrics });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
