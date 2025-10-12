import express from "express";
import { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest, verifyToken } from "../middleware/auth.js";
import Agent from "../models/Agent.js";

import { PropertyModel } from "../models/Property.js";

const router = express.Router();

router.get("/", verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (
      !req.agent ||
      typeof req.agent !== "object" ||
      !("userId" in req.agent)
    ) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    const { userId } = req.agent as JwtPayload;

    const agent = await Agent.findOne({ userId });
    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // 🔍 Real DB queries
    const totalListings = await PropertyModel.countDocuments({
      agentId: userId,
    });
    const activeAgents = await Agent.countDocuments({ status: "Verified" });

    // Simulate weekly views (replace with real analytics if available)
    const viewsThisWeek = await PropertyModel.aggregate([
      { $match: { agentId: userId } },
      { $group: { _id: null, totalViews: { $sum: "$viewsThisWeek" } } },
    ]);

    const recentActivity = await PropertyModel.find({ agentId: userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title createdAt");

    const activityFeed = recentActivity.map((listing) => ({
      type: "listing",
      message: `New listing added: “${listing.title}”`,
    }));

    const metrics = {
      totalListings,
      activeAgents,
      viewsThisWeek: viewsThisWeek[0]?.totalViews || 0,
      recentActivity: activityFeed,
    };

    res.status(200).json({ agent, metrics });
  } catch (err) {
    res.status(500).json({ error: "Dashboard fetch failed", details: err });
  }
});

export default router;
