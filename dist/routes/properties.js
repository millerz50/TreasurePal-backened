"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const node_appwrite_1 = require("node-appwrite");
const uploadToAppwrite_1 = require("../lib/uploadToAppwrite");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const PROPERTIES_COLLECTION = "properties";
const AGENTS_COLLECTION = "agents";
// ✅ Get all properties
router.get("/all", async (_req, res) => {
    try {
        const result = await databases.listDocuments(DB_ID, PROPERTIES_COLLECTION, [], "100");
        const formatted = result.documents.map((p) => ({
            ...p,
            amenities: p.amenities?.split(",") ?? [],
            coordinates: p.coordinates?.split(",").map(Number) ?? [],
        }));
        res.json(formatted);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to fetch properties", details: err.message });
    }
});
// ✅ Get a property by ID
router.get("/:id", async (req, res) => {
    try {
        const property = await databases.getDocument(DB_ID, PROPERTIES_COLLECTION, req.params.id);
        const formatted = {
            ...property,
            amenities: property.amenities?.split(",") ?? [],
            coordinates: property.coordinates?.split(",").map(Number) ?? [],
        };
        res.json(formatted);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to fetch property", details: err.message });
    }
});
// ✅ Create a new property
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const { amenities, coordinates, agentId: rawAgentId, ...rest } = req.body;
        const agentId = String(rawAgentId);
        const agentExists = await databases.getDocument(DB_ID, AGENTS_COLLECTION, agentId);
        if (!agentExists)
            return res.status(400).json({ error: "Invalid agentId" });
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, uploadToAppwrite_1.uploadToAppwriteBucket)(req.file.buffer, req.file.originalname);
        }
        const property = await databases.createDocument(DB_ID, PROPERTIES_COLLECTION, node_appwrite_1.ID.unique(), {
            ...rest,
            agentId,
            amenities: Array.isArray(amenities) ? amenities.join(",") : amenities,
            coordinates: Array.isArray(coordinates)
                ? coordinates.join(",")
                : coordinates,
            imageUrl,
        });
        res.status(201).json(property);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to create property", details: err.message });
    }
});
// ✅ Update a property
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const { amenities, coordinates, ...rest } = req.body;
        let imageUrl = null;
        if (req.file) {
            imageUrl = await (0, uploadToAppwrite_1.uploadToAppwriteBucket)(req.file.buffer, req.file.originalname);
        }
        const updates = {
            ...rest,
            ...(amenities && {
                amenities: Array.isArray(amenities) ? amenities.join(",") : amenities,
            }),
            ...(coordinates && {
                coordinates: Array.isArray(coordinates)
                    ? coordinates.join(",")
                    : coordinates,
            }),
            ...(imageUrl && { imageUrl }),
        };
        const property = await databases.updateDocument(DB_ID, PROPERTIES_COLLECTION, req.params.id, updates);
        res.json(property);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update property", details: err.message });
    }
});
// ✅ Delete a property (image deletion optional)
router.delete("/:id", async (req, res) => {
    try {
        await databases.deleteDocument(DB_ID, PROPERTIES_COLLECTION, req.params.id);
        res.status(204).send();
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to delete property", details: err.message });
    }
});
exports.default = router;
