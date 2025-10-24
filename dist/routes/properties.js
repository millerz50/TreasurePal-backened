"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const firebaseAdmin_1 = require("../lib/firebaseAdmin"); // ✅ Firebase Admin SDK
const prisma_1 = require("../lib/prisma"); // ✅ Singleton Prisma
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// ✅ Get all properties
router.get("/all", async (_req, res) => {
    try {
        const properties = await prisma_1.prisma.property.findMany({
            include: { agent: true },
        });
        const formatted = properties.map((p) => ({
            ...p,
            amenities: p.amenities.split(","),
            coordinates: p.coordinates.split(",").map(Number),
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
        const id = parseInt(req.params.id, 10);
        const property = await prisma_1.prisma.property.findUnique({ where: { id } });
        if (!property)
            return res.status(404).json({ error: "Not found" });
        const formatted = {
            ...property,
            amenities: property.amenities.split(","),
            coordinates: property.coordinates.split(",").map(Number),
        };
        res.json(formatted);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to fetch property", details: err.message });
    }
});
// ✅ Upload image to Firebase Admin
const uploadImageToFirebase = async (file) => {
    const fileName = `properties/${Date.now()}_${(0, uuid_1.v4)()}_${file.originalname}`;
    const firebaseFile = firebaseAdmin_1.bucket.file(fileName);
    await firebaseFile.save(file.buffer, {
        metadata: { contentType: file.mimetype },
        public: true,
    });
    return `https://storage.googleapis.com/${firebaseAdmin_1.bucket.name}/${fileName}`;
};
// ✅ Create a new property
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const { amenities, coordinates, agentId, ...rest } = req.body;
        const parsedAgentId = parseInt(agentId, 10);
        if (isNaN(parsedAgentId))
            return res.status(400).json({ error: "Invalid agentId" });
        let imageUrl = null;
        if (req.file)
            imageUrl = await uploadImageToFirebase(req.file);
        const property = await prisma_1.prisma.property.create({
            data: {
                ...rest,
                agentId: parsedAgentId,
                amenities: Array.isArray(amenities) ? amenities.join(",") : amenities,
                coordinates: Array.isArray(coordinates)
                    ? coordinates.join(",")
                    : coordinates,
                imageUrl,
            },
        });
        res.status(201).json(property);
    }
    catch (err) {
        console.error("❌ Property creation failed:", err);
        res
            .status(500)
            .json({ error: "Failed to create property", details: err.message });
    }
});
// ✅ Update a property
router.put("/:id", upload.single("image"), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { amenities, coordinates, ...rest } = req.body;
        let imageUrl = null;
        if (req.file)
            imageUrl = await uploadImageToFirebase(req.file);
        const property = await prisma_1.prisma.property.update({
            where: { id },
            data: {
                ...rest,
                ...(amenities && {
                    amenities: Array.isArray(amenities)
                        ? amenities.join(",")
                        : amenities,
                }),
                ...(coordinates && {
                    coordinates: Array.isArray(coordinates)
                        ? coordinates.join(",")
                        : coordinates,
                }),
                ...(imageUrl && { imageUrl }),
            },
        });
        res.json(property);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update property", details: err.message });
    }
});
// ✅ Delete a property and its image
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const property = await prisma_1.prisma.property.findUnique({ where: { id } });
        if (property?.imageUrl) {
            const match = property.imageUrl.match(/properties\/(.+)$/);
            if (match) {
                const firebaseFile = firebaseAdmin_1.bucket.file(`properties/${match[1]}`);
                await firebaseFile.delete();
            }
        }
        await prisma_1.prisma.property.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to delete property", details: err.message });
    }
});
exports.default = router;
