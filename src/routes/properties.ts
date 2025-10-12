import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

// ✅ Get all properties
router.get("/all", async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: { agent: true },
    });

    const formatted = properties.map((p) => ({
      ...p,
      amenities: p.amenities.split(","),
      coordinates: p.coordinates.split(",").map(Number),
    }));

    res.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: message });
  }
});

// ✅ Get a property by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) return res.status(404).json({ error: "Not found" });

    const formatted = {
      ...property,
      amenities: property.amenities.split(","),
      coordinates: property.coordinates.split(",").map(Number),
    };

    res.json(formatted);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch property", details: message });
  }
});

// ✅ Create a new property
router.post("/add", async (req, res) => {
  try {
    const { amenities, coordinates, ...rest } = req.body;

    const property = await prisma.property.create({
      data: {
        ...rest,
        amenities: amenities.join(","),
        coordinates: coordinates.join(","),
      },
    });

    res.status(201).json(property);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Create error:", message);
    res
      .status(500)
      .json({ error: "Failed to create property", details: message });
  }
});

// ✅ Update a property by ID
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { amenities, coordinates, ...rest } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...rest,
        ...(amenities && { amenities: amenities.join(",") }),
        ...(coordinates && { coordinates: coordinates.join(",") }),
      },
    });

    res.json(property);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Update error:", message);
    res
      .status(500)
      .json({ error: "Failed to update property", details: message });
  }
});

// ✅ Delete a property by ID
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.property.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Delete error:", message);
    res
      .status(500)
      .json({ error: "Failed to delete property", details: message });
  }
});

export default router;
