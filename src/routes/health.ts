import { Router } from "express";
import { prisma } from "../lib/prisma"; // ✅ Singleton Prisma

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      db: "disconnected",
      timestamp: new Date().toISOString(),
      details: String(err),
    });
  }
});

export default router;
