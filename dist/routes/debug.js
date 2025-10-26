"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma"); // ✅ Singleton Prisma
const router = express_1.default.Router();
// ⚠️ Debug route — restrict in production
router.get("/password", async (req, res) => {
    const email = req.query.email;
    if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email query required" });
    }
    try {
        const agent = await prisma_1.prisma.agent.findUnique({ where: { email } });
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        res.json({
            email: agent.email,
            isHashed: agent.password.startsWith("$2b$"),
            passwordPreview: agent.password.slice(0, 10) + "...", // ✅ Partial hash only
        });
    }
    catch (err) {
        res.status(500).json({ error: "Debug failed", details: String(err) });
    }
});
exports.default = router;
