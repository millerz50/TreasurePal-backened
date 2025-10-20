import { Router } from "express";
import {
  deleteUser,
  editUser,
  getAllUsers,
  getUserProfile,
  loginUser,
  signup,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken";
import { validateLogin } from "../validators/validateLogin";
import { validateUser } from "../validators/validateUser";

const router: Router = Router();

const isProd = process.env.NODE_ENV === "production";

// Signup route
router.post("/signup", isProd ? signup : [validateUser, signup]);

// Login route
router.post("/login", isProd ? loginUser : [validateLogin, loginUser]);

// Protected routes
router.get("/me", verifyToken, getUserProfile);
router.put("/:id", verifyToken, isProd ? editUser : [validateUser, editUser]);
router.delete("/:id", verifyToken, deleteUser);

// Public or protected route depending on your use case
router.get("/all", verifyToken, getAllUsers);

export default router;
