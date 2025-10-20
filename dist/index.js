"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({
    path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});
const client_1 = require("@prisma/client");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Modular routers
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const agent_js_1 = __importDefault(require("./routes/agent.js"));
const dashboard_js_1 = __importDefault(require("./routes/dashboard.js"));
const debug_js_1 = __importDefault(require("./routes/debug.js"));
const health_js_1 = __importDefault(require("./routes/health.js"));
const properties_js_1 = __importDefault(require("./routes/properties.js"));
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const PORT = parseInt(process.env.PORT || "4011", 10);
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.set("trust proxy", true);
// ✅ Middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.set("trust proxy", 1);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/json", express_1.default.json());
app.use((0, morgan_1.default)("dev"));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use("/api", limiter);
// ✅ Routes
app.use("/api/properties", properties_js_1.default);
app.use("/api", health_js_1.default);
app.use("/api/agents", agent_js_1.default);
app.use("/api/dashboard", dashboard_js_1.default);
app.use("/api/debug", debug_js_1.default);
app.use("/api/users", userRoutes_js_1.default);
app.use("/api/admins", adminRoutes_js_1.default);
app.use("/api/user", userRoutes_js_1.default);
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
