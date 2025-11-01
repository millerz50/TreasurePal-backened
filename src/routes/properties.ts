import { Request, Response, Router } from "express";
import multer from "multer";
import { Client, Databases, ID } from "node-appwrite";
import { uploadToAppwriteBucket } from "../lib/uploadToAppwrite";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const PROPERTIES_COLLECTION = "properties";
const AGENTS_COLLECTION = "agents";

// ✅ Get all properties
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const result = await databases.listDocuments(
      DB_ID,
      PROPERTIES_COLLECTION,
      [],
      "100"
    );

    const formatted = result.documents.map((p) => ({
      ...p,
      amenities: p.amenities?.split(",") ?? [],
      coordinates: p.coordinates?.split(",").map(Number) ?? [],
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
    const property = await databases.getDocument(
      DB_ID,
      PROPERTIES_COLLECTION,
      req.params.id
    );

    const formatted = {
      ...property,
      amenities: property.amenities?.split(",") ?? [],
      coordinates: property.coordinates?.split(",").map(Number) ?? [],
    };

    res.json(formatted);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch property", details: err.message });
  }
});

// ✅ Create a new property
router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { amenities, coordinates, agentId: rawAgentId, ...rest } = req.body;
      const agentId = String(rawAgentId);

      const agentExists = await databases.getDocument(
        DB_ID,
        AGENTS_COLLECTION,
        agentId
      );
      if (!agentExists)
        return res.status(400).json({ error: "Invalid agentId" });

      let imageUrl: string | null = null;
      if (req.file) {
        imageUrl = await uploadToAppwriteBucket(
          req.file.buffer,
          req.file.originalname
        );
      }

      const property = await databases.createDocument(
        DB_ID,
        PROPERTIES_COLLECTION,
        ID.unique(),
        {
          ...rest,
          agentId,
          amenities: Array.isArray(amenities) ? amenities.join(",") : amenities,
          coordinates: Array.isArray(coordinates)
            ? coordinates.join(",")
            : coordinates,
          imageUrl,
        }
      );

      res.status(201).json(property);
    } catch (err: any) {
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
      const { amenities, coordinates, ...rest } = req.body;

      let imageUrl: string | null = null;
      if (req.file) {
        imageUrl = await uploadToAppwriteBucket(
          req.file.buffer,
          req.file.originalname
        );
      }

      const updates: any = {
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

      const property = await databases.updateDocument(
        DB_ID,
        PROPERTIES_COLLECTION,
        req.params.id,
        updates
      );
      res.json(property);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: "Failed to update property", details: err.message });
    }
  }
);

// ✅ Delete a property (image deletion optional)
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await databases.deleteDocument(DB_ID, PROPERTIES_COLLECTION, req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to delete property", details: err.message });
  }
});

export default router;
