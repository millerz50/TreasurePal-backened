import dotenv from "dotenv";
dotenv.config({
    path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});
import { PrismaClient } from "@prisma/client";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
// Modular routers
import adminRoutes from "./routes/adminRoutes.js";
import agentRouter from "./routes/agent.js";
import dashboardRouter from "./routes/dashboard.js";
import debugRouter from "./routes/debug.js";
import healthRouter from "./routes/health.js";
import propertiesRouter from "./routes/properties.js";
import userRoutes from "./routes/userRoutes.js";
const PORT = parseInt(process.env.PORT || "4011", 10);
const prisma = new PrismaClient();
const app = express();
app.set("trust proxy", true);
// ✅ Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
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
app.use("/api/users", userRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/admins", adminRoutes);
// ✅ Health check
app.get("/api/health", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({ status: "✅ SQLite connected" });
    }
    catch (err) {
        res.status(500).json({ status: "❌ SQLite connection failed", error: err });
    }
});
app.use((err, req, res, next) => {
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
