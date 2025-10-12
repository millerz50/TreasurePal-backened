import { PrismaClient } from "@prisma/client";
import express, { Response } from "express";
import { AuthenticatedRequest, verifyToken } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

router.get(
  "/",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const payload = req.agent;

      if (
        !payload ||
        typeof payload !== "object" ||
        !("userId" in payload) ||
        typeof payload.userId !== "string"
      ) {
        return res.status(401).json({ error: "Invalid token payload" });
      }

      const { userId } = payload;

      const agent = await prisma.agent.findUnique({ where: { userId } });
      if (!agent) return res.status(404).json({ error: "Agent not found" });

      const totalListings = await prisma.property.count({
        where: { agentId: agent.id },
      });

      const activeAgents = await prisma.agent.count({
        where: { status: "Verified" },
      });

      const viewsThisWeekAgg = await prisma.property.aggregate({
        _sum: { viewsThisWeek: true },
        where: { agentId: agent.id },
      });

      const recentActivity = await prisma.property.findMany({
        where: { agentId: agent.id },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { title: true, createdAt: true },
      });

      const activityFeed = recentActivity.map((listing: { title: string }) => ({
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
    } catch (err) {
      res
        .status(500)
        .json({ error: "Dashboard fetch failed", details: String(err) });
    }
  }
);

export default router;
