import express, { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { verifyToken } from "../middleware/verifyToken";
import { getAgentDashboardMetrics } from "../services/dashboard";

const router = express.Router();

router.get(
  "/metrics",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { agent } = req;

      if (!agent || !agent.id || !agent.token) {
        return next(new Error("Invalid token payload"));
      }

      const audit = await prisma.agent.findUnique({
        where: { id: agent.id },
      });

      if (!audit) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const metrics = await getAgentDashboardMetrics(agent.id);

      await prisma.agentMetricRecord.create({
        data: {
          agentId: agent.id,
          metrics,
        },
      });

      res.status(200).json({ agent, metrics });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
