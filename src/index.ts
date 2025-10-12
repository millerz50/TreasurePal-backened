import dotenv from "dotenv";
dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

import compression from "compression";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";

// Modular routers
import agentRouter from "./routes/agent.js";
import dashboardRouter from "./routes/dashboard.js";
import debugRouter from "./routes/debug.js";
import healthRouter from "./routes/health.js";
import propertiesRouter from "./routes/properties.js";

const PORT = process.env.PORT || 4011;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/treasurepal";

const app = express();

// ✅ Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust for production
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

// ✅ Health check route
app.get("/api/health", (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.json({
    mongoState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    status:
      mongoState === 1
        ? "✅ MongoDB connected"
        : mongoState === 2
        ? "⏳ Connecting..."
        : "❌ Not connected",
  });
});

// ✅ Error handler
app.use((err: unknown, _req: Request, res: Response) => {
  console.error("❌ Uncaught error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: err instanceof Error ? err.message : String(err),
  });
});

// ✅ MongoDB connection with retry logic
async function connectWithRetry(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(
      `❌ MongoDB connection failed (attempt ${attempt}). Retrying in 5s...`
    );
    setTimeout(() => connectWithRetry(attempt + 1), 5000);
  }
}

connectWithRetry();

export {};
