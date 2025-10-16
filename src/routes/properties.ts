import { PrismaClient } from "@prisma/client";
import { Request, Response, Router } from "express";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import multer from "multer";
import { storage } from "../../lib/firebase"; // ✅ Firebase setup

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Get all properties
router.get("/all", async (_req: Request, res: Response) => {
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
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: err.message });
  }
});

// ✅ Get a property by ID
router.get("/:id", async (req: Request, res: Response) => {
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
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch property", details: err.message });
  }
});

// ✅ Create a new property with image upload
router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { amenities, coordinates, agentId, ...rest } = req.body;

      const parsedAgentId = parseInt(agentId, 10);
      if (isNaN(parsedAgentId)) {
        return res.status(400).json({ error: "Invalid agentId" });
      }

      let imageUrl: string | null = null;
      if (req.file) {
        const imageRef = ref(
          storage,
          `properties/${Date.now()}_${req.file.originalname}`
        );
        const snapshot = await uploadBytes(imageRef, req.file.buffer);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const property = await prisma.property.create({
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
    } catch (err: any) {
      console.error("❌ Property creation failed:", err);
      res
        .status(500)
        .json({ error: "Failed to create property", details: err.message });
    }
  }
);

// ✅ Update a property by ID
router.put(
  "/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { amenities, coordinates, ...rest } = req.body;

      let imageUrl: string | null = null;
      if (req.file) {
        const imageRef = ref(
          storage,
          `properties/${Date.now()}_${req.file.originalname}`
        );
        const snapshot = await uploadBytes(imageRef, req.file.buffer);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const property = await prisma.property.update({
        where: { id },
        data: {
          ...rest,
          ...(amenities && { amenities: amenities.split(",").join(",") }),
          ...(coordinates && { coordinates: coordinates.split(",").join(",") }),
          ...(imageUrl && { imageUrl }),
        },
      });

      res.json(property);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to update property", details: err.message });
    }
  }
);

// ✅ Delete a property and its image
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const property = await prisma.property.findUnique({ where: { id } });

    if (property?.imageUrl) {
      const match = property.imageUrl.match(/properties\/(.+)$/);
      if (match) {
        const imageRef = ref(storage, `properties/${match[1]}`);
        await deleteObject(imageRef);
      }
    }

    await prisma.property.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to delete property", details: err.message });
  }
});

export default router;
