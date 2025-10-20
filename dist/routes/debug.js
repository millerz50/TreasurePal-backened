"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get("/password", async (_req, res) => {
    try {
        const agent = await prisma.agent.findUnique({
            where: { email: "johwanisi1@gmail.com" },
        });
        if (!agent) {
            return res.status(404).json({ error: "Agent not found" });
        }
        console.log("Stored password:", agent.password);
        res.json({
            email: agent.email,
            password: agent.password,
            isHashed: agent.password.startsWith("$2b$"),
        });
    }
    catch (err) {
        res.status(500).json({ error: "Debug failed", details: String(err) });
    }
});
exports.default = router;
