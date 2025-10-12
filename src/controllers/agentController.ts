import bcrypt from "bcrypt";
import { Request, Response } from "express";
import Agent from "../models/Agent";

export const registerAgent = async (req: Request, res: Response) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = new Agent({ ...rest, password: hashedPassword });
    await agent.save();
    res.status(201).json(agent);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "Registration failed", details: message });
  }
};

export const getAgents = async (_req: Request, res: Response) => {
  try {
    const agents = await Agent.find();
    res.json(agents);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Failed to fetch agents", details: message });
  }
};

export const getAgentById = async (req: Request, res: Response) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    res.json(agent);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "Invalid ID format", details: message });
  }
};

export const updateAgent = async (req: Request, res: Response) => {
  try {
    const updated = await Agent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Agent not found" });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "Update failed", details: message });
  }
};

export const deleteAgent = async (req: Request, res: Response) => {
  try {
    const result = await Agent.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Agent not found" });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: "Invalid ID format", details: message });
  }
};

export const verifyAgent = async (req: Request, res: Response) => {
  const { email } = req.body;
  const imageUrl = req.file?.path;

  if (!email || !imageUrl) {
    return res.status(400).json({ error: "Email and image are required" });
  }

  try {
    const agent = await Agent.findOneAndUpdate(
      { email },
      {
        imageUrl,
        emailVerified: true,
        status: "Verified",
      },
      { new: true }
    );

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    res.json({ message: "Agent verified successfully", agent });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "Verification failed", details: message });
  }
};
