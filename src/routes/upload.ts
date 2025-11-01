import express from "express";
import { uploadToAppwriteBucket } from "../lib/uploadToAppwrite";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const url = await uploadToAppwriteBucket(
      req.file.buffer,
      req.file.originalname
    );
    return res.json({ url });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
