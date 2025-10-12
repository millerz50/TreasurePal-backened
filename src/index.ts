import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

import { PrismaClient } from "@prisma/client";
import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

// Modular routers
import agentRouter from "./routes/agent.js";
import dashboardRouter from "./routes/dashboard.js";
import debugRouter from "./routes/debug.js";
import healthRouter from "./routes/health.js";
import propertiesRouter from "./routes/properties.js";

const PORT = parseInt(process.env.PORT || "4011", 10);
const prisma = new PrismaClient();

const app = express();

// ✅ Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use("/api", limiter);

// ✅ Routes
app.use("/api/properties", propertiesRouter);
app.use("/api", healthRouter);
app.use("/api/agents", agentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/debug", debugRouter);

// ✅ Health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "✅ SQLite connected" });
  } catch (err) {
    res.status(500).json({ status: "❌ SQLite connection failed", error: err });
  }
});

// ✅ Error handler
app.use((err: unknown, _req: Request, res: Response) => {
  console.error("❌ Uncaught error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err instanceof Error ? err.message : String(err),
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export {};
