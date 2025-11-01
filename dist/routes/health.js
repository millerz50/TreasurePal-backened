"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_appwrite_1 = require("node-appwrite");
const router = (0, express_1.Router)();
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const COLLECTION_ID = "agents"; // Use any known collection
router.get("/health", async (_req, res) => {
    try {
        // Try listing a single document to confirm DB connectivity
        await databases.listDocuments(DB_ID, COLLECTION_ID, [], "1");
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
