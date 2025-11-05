import { Router } from "express";
import { Client, ID, TablesDB } from "node-appwrite";

const router = Router();

//
// ✅ Appwrite Client Setup
//
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)
  .setSelfSigned(true); // Optional for localhost/self-hosted

const tablesDB = new TablesDB(client);

//
// ✅ Health Check Route
//
const DB_ID = "6903251e00392e27421f"; // Replace with your actual TablesDB ID

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

//
// ✅ Setup Route (Create DB + Table + Columns)
//
router.post("/setup", async (_req, res) => {
  try {
    const todoDatabase = await tablesDB.create({
      databaseId: ID.unique(),
      name: "TodosDB",
    });

    const todoTable = await tablesDB.createTable({
      databaseId: todoDatabase.$id,
      tableId: ID.unique(),
      name: "Todos",
    });

    await tablesDB.createStringColumn({
      databaseId: todoDatabase.$id,
      tableId: todoTable.$id,
      key: "title",
      size: 255,
      required: true,
    });

    await tablesDB.createStringColumn({
      databaseId: todoDatabase.$id,
      tableId: todoTable.$id,
      key: "description",
      size: 255,
      required: false,
      xdefault: "This is a test description",
    });

    await tablesDB.createBooleanColumn({
      databaseId: todoDatabase.$id,
      tableId: todoTable.$id,
      key: "isComplete",
      required: true,
    });

    console.log("✅ TablesDB setup complete:", {
      databaseId: todoDatabase.$id,
      tableId: todoTable.$id,
    });

    res.json({
      status: "setup complete",
      databaseId: todoDatabase.$id,
      tableId: todoTable.$id,
    });
  } catch (err: any) {
    console.error("❌ Setup failed:", err.message || err);
    res.status(500).json({ error: err.message || err });
  }
});

export default router;
