import { Router } from "express";
import {
  approveBlogPost,
  createAdmin,
  deleteAgentById,
  deletePropertyById,
  deleteUserById,
} from "../controllers/adminController";

const router = Router();

router.post("/create", createAdmin);
router.post("/approve-blog", approveBlogPost);
router.delete("/user/:id", deleteUserById);
router.delete("/agent/:id", deleteAgentById);
router.delete("/property/:id", deletePropertyById);

export default router;
