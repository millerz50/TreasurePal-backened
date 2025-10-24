"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma"); // ✅ Singleton Prisma
const router = (0, express_1.Router)();
router.get("/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
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
