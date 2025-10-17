import { PrismaClient } from "@prisma/client";
import express from "express";
const router = express.Router();
const prisma = new PrismaClient();
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
export default router;
