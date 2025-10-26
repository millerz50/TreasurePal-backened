import express from "express";
import { prisma } from "../lib/prisma"; // ✅ Singleton Prisma

const router = express.Router();

// ⚠️ Debug route — restrict in production
router.get("/password", async (req, res) => {
  const email = req.query.email as string;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email query required" });
  }

  try {
    const agent = await prisma.agent.findUnique({ where: { email } });

    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      email: agent.email,
      isHashed: agent.password.startsWith("$2b$"),
      passwordPreview: agent.password.slice(0, 10) + "...", // ✅ Partial hash only
    });
  } catch (err) {
    res.status(500).json({ error: "Debug failed", details: String(err) });
  }
});

export default router;
