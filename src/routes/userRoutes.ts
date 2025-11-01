import { Router } from "express";
import {
  deleteUser,
  editUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  signup,
} from "../controllers/userController";

import {
  approveBlog,
  createAdminAccount,
  removeProperty,
  removeUser,
} from "../services/adminService";

import {
  createAgent,
  deleteAgent,
  getAgentByEmail,
  getAgentById,
  getAllAgents,
  updateAgent,
} from "../services/agentService";

import { verifyToken } from "../middleware/verifyToken";
import { verifyTokenAndAdmin } from "../middleware/verifyTokenAndAdmin";

const router = Router();

// 🔓 Public routes
router.post("/signup", signup);
router.post("/login", loginUser);

// 🔐 Authenticated user routes
router.get("/me", verifyToken, getUserProfile);
router.put("/:id", verifyToken, editUser);
router.delete("/:id", verifyToken, deleteUser);
router.get("/all", verifyToken, getAllUsers);

// 🛡️ Admin-only routes
router.post("/admin/signup", verifyTokenAndAdmin, async (req, res) => {
  try {
    const admin = await createAdminAccount(req.body);
    res.status(201).json(admin);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/approve-blog", verifyTokenAndAdmin, async (req, res) => {
  try {
    const { postId } = req.body;

    if (!req.user?.id) {
      throw new Error("Missing authenticated user ID");
    }

    const result = await approveBlog(postId, req.user.id);
    res.json(result);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

router.delete("/property/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await removeProperty(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/user/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await removeUser(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 🧭 Agent routes
router.post("/agent/signup", async (req, res) => {
  try {
    const agent = await createAgent(req.body);
    res.status(201).json(agent);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/agent/:agentId", verifyToken, async (req, res) => {
  try {
    const updated = await updateAgent(req.params.agentId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.delete("/agent/:agentId", verifyToken, async (req, res) => {
  try {
    await deleteAgent(req.params.agentId);
    res.status(204).send();
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/agent/email/:email", verifyToken, async (req, res) => {
  try {
    const agent = await getAgentByEmail(req.params.email);
    res.json(agent);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/agent/id/:agentId", verifyToken, async (req, res) => {
  try {
    const agent = await getAgentById(req.params.agentId);
    res.json(agent);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

router.get("/agents", verifyToken, async (_req, res) => {
  try {
    const agents = await getAllAgents();
    res.json(agents);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
