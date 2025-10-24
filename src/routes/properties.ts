import { Request, Response, Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { bucket } from "../lib/firebaseAdmin"; // ✅ Firebase Admin SDK
import { prisma } from "../lib/prisma"; // ✅ Singleton Prisma

const router = Router();
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

// ✅ Upload image to Firebase Admin
const uploadImageToFirebase = async (
  file: Express.Multer.File
): Promise<string> => {
  const fileName = `properties/${Date.now()}_${uuidv4()}_${file.originalname}`;
  const firebaseFile = bucket.file(fileName);

  await firebaseFile.save(file.buffer, {
    metadata: { contentType: file.mimetype },
    public: true,
  });

  return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
};

// ✅ Create a new property
router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { amenities, coordinates, agentId, ...rest } = req.body;
      const parsedAgentId = parseInt(agentId, 10);
      if (isNaN(parsedAgentId))
        return res.status(400).json({ error: "Invalid agentId" });

      let imageUrl: string | null = null;
      if (req.file) imageUrl = await uploadImageToFirebase(req.file);

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

// ✅ Update a property
router.put(
  "/:id",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { amenities, coordinates, ...rest } = req.body;

      let imageUrl: string | null = null;
      if (req.file) imageUrl = await uploadImageToFirebase(req.file);

      const property = await prisma.property.update({
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
        const firebaseFile = bucket.file(`properties/${match[1]}`);
        await firebaseFile.delete();
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
