import { Router } from "express";
import { approveBlogPost, createAdmin, deleteAgent, deleteProperty, deleteUser, } from "../controllers/adminController.js";
const router = Router();
router.post("/create", createAdmin); // ✅ Register the route
router.post("/approve-blog", approveBlogPost);
router.delete("/user/:id", deleteUser);
router.delete("/agent/:id", deleteAgent);
router.delete("/property/:id", deleteProperty);
export default router;
