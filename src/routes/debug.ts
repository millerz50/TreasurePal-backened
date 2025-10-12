import express from "express";
import Agent from "../models/Agent.js";

const router = express.Router();

router.get("/password", async (_req, res) => {
  try {
    const agent = await Agent.findOne({ email: "johwanisi1@gmail.com" }).select(
      "+password"
    );
    console.log("Stored password:", agent?.password);

    res.json({
      email: agent?.email,
      password: agent?.password,
      isHashed: agent?.password?.startsWith("$2b$"),
    });
  } catch (err) {
    res.status(500).json({ error: "Debug failed", details: err });
  }
});

export default router;
