import express from "express";
import { Client, Databases, Query } from "node-appwrite";

const router = express.Router();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const AGENTS_COLLECTION = "agents";

// ⚠️ Debug route — restrict in production
router.get("/password", async (req, res) => {
  const email = req.query.email as string;

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email query required" });
  }

  try {
    const result = await databases.listDocuments(DB_ID, AGENTS_COLLECTION, [
      Query.equal("email", email.toLowerCase()),
    ]);

    const agent = result.documents[0];
    if (!agent || typeof agent.password !== "string") {
      return res.status(404).json({ error: "Agent not found" });
    }

    res.json({
      email: agent.email,
      isHashed: agent.password.startsWith("$2b$"),
      passwordPreview: agent.password.slice(0, 10) + "...", // ✅ Partial hash only
    });
  } catch (err) {
    res.status(500).json({ error: "Debug failed", details: String(err) });
  }
});

export default router;
