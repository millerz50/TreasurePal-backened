import { Router } from "express";
import { PropertyModel } from "../models/Property.js";

const router = Router();

// ✅ Get all properties
router.get("/all", async (_req, res) => {
  try {
    const properties = await PropertyModel.find().lean().exec();
    res.json(properties);
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
    const property = await PropertyModel.findById(req.params.id).lean().exec();
    if (!property) return res.status(404).json({ error: "Not found" });
    res.json(property);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: message });
  }
});

// ✅ Create a new property
router.post("/add", async (req, res) => {
  try {
    const property = new PropertyModel(req.body);
    await property.save();
    res.status(201).json(property.toJSON());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: message });
  }
});

// ✅ Update a property by ID
router.put("/:id", async (req, res) => {
  try {
    const property = await PropertyModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .lean()
      .exec();

    if (!property) return res.status(404).json({ error: "Not found" });
    res.json(property);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: message });
  }
});

// ✅ Delete a property by ID
router.delete("/:id", async (req, res) => {
  try {
    const result = await PropertyModel.findByIdAndDelete(req.params.id).exec();
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ Fetch error:", message);
    res
      .status(500)
      .json({ error: "Failed to fetch properties", details: message });
  }
});

export default router;
