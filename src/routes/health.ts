import { Router } from "express";
import { Client, Databases } from "node-appwrite";

const router = Router();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)
  .setSelfSigned(true); // Optional for localhost/self-hosted

const databases = new Databases(client);

const DB_ID = "6903251e00392e27421f"; // Confirmed database ID

router.get("/health", async (_req, res) => {
  const timestamp = new Date().toISOString();

  try {
    const collections = await databases.listCollections(DB_ID);
    console.log("✅ Connected to DB. Found", collections.total, "collections.");

    return res.json({
      status: "ok",
      db: "connected",
      timestamp,
      collectionCount: collections.total,
    });
  } catch (err: any) {
    console.error("❌ DB connection failed:", err.message || err);
    return res.status(500).json({
      status: "error",
      db: "disconnected",
      timestamp,
      details: err.message || err,
    });
  }
});

export default router;
