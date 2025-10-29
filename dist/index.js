"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
<<<<<<< HEAD
require("express-async-errors"); // ✅ Optional: catch async errors
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
=======
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("./lib/logger");
>>>>>>> backend-cleanup
const prisma_1 = require("./lib/prisma");
// Routers
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const agent_js_1 = __importDefault(require("./routes/agent.js"));
const dashboard_js_1 = __importDefault(require("./routes/dashboard.js"));
const debug_js_1 = __importDefault(require("./routes/debug.js"));
const health_js_1 = __importDefault(require("./routes/health.js"));
const properties_js_1 = __importDefault(require("./routes/properties.js"));
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const PORT = parseInt(process.env.PORT || "4011", 10);
const app = (0, express_1.default)();
app.set("trust proxy", true);
//
// ✅ Security + Performance
//
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
//
// ✅ Dynamic CORS
//
const allowedOrigins = [
    "http://localhost:3000",
    "https://treasure-pal.vercel.app",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use((0, cors_1.default)(corsOptions));
//
// ✅ Body Parsing
//
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/json", express_1.default.json());
//
<<<<<<< HEAD
// ✅ Logging
//
app.use((0, morgan_1.default)("dev"));
=======
// ✅ Logging with Morgan + Winston
//
app.use((0, morgan_1.default)("combined", {
    stream: {
        write: (message) => logger_1.logger.info(message.trim()),
    },
}));
>>>>>>> backend-cleanup
//
// ✅ Rate Limiting
//
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
        trustProxy: false,
    },
});
app.use("/api", limiter);
//
// ✅ Routes
//
app.use("/api/properties", properties_js_1.default);
app.use("/api", health_js_1.default);
app.use("/api/agents", agent_js_1.default);
app.use("/api/dashboard", dashboard_js_1.default);
app.use("/api/debug", debug_js_1.default);
app.use("/api/users", userRoutes_js_1.default);
app.use("/api/admins", adminRoutes_js_1.default);
app.use("/api/user", userRoutes_js_1.default); // Optional alias
//
// ✅ Health Check
//
app.get("/api/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({ status: "✅ PostgreSQL connected" });
    }
    catch (err) {
<<<<<<< HEAD
        res.status(500).json({ status: "❌ DB connection failed", error: err });
=======
        const message = err instanceof Error ? err.message : String(err);
        logger_1.logger.error(`Health check failed: ${message}`, err);
        res.status(500).json({ status: "❌ DB connection failed", error: message });
>>>>>>> backend-cleanup
    }
});
//
// ✅ Error Handler
//
app.use((err, req, res, next) => {
<<<<<<< HEAD
    console.error("❌ Uncaught error:", err);
    res.status(500).json({
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
=======
    const message = err instanceof Error ? err.message : String(err);
    logger_1.logger.error(`❌ Uncaught error: ${message}`, err);
    res.status(500).json({
        error: "Internal server error",
        details: message,
>>>>>>> backend-cleanup
    });
});
//
// ✅ Graceful Shutdown
//
process.on("SIGINT", async () => {
<<<<<<< HEAD
    console.log("🛑 Shutting down gracefully...");
=======
    logger_1.logger.info("🛑 Shutting down gracefully...");
>>>>>>> backend-cleanup
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
//
// ✅ Start Server
//
app.listen(PORT, () => {
<<<<<<< HEAD
    console.log(`🚀 Server running on http://localhost:${PORT}`);
=======
    logger_1.logger.info(`🚀 Server running on http://localhost:${PORT}`);
>>>>>>> backend-cleanup
});
