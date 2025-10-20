"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        res.json({
            status: "ok",
            db: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (err) {
        res.status(500).json({
            status: "error",
            db: "disconnected",
            timestamp: new Date().toISOString(),
            details: String(err),
        });
    }
});
exports.default = router;
