import { Router } from "express";
import { Client, TablesDB } from "node-appwrite";

const router = Router();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)
  .setSelfSigned(true);

const tablesDB = new TablesDB(client);
const DB_ID = "6903251e00392e27421f";

router.get("/health", async (_req, res) => {
  const timestamp = new Date().toISOString();

  try {
    const tables = await tablesDB.listTables(DB_ID);
    console.log("✅ Connected to TablesDB. Found", tables.total, "tables.");

    return res.json({
      status: "ok",
      db: "connected",
      timestamp,
      tableCount: tables.total,
    });
  } catch (err: any) {
    console.error("❌ TablesDB connection failed:", err.message || err);
    return res.status(500).json({
      status: "error",
      db: "disconnected",
      timestamp,
      details: err.message || err,
    });
  }
});

export default router;
