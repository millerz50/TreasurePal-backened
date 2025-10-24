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
import { withValidation } from "../utils/conditionalMiddleware";
import { validateLogin } from "../validators/validateLogin";
import { validateUser } from "../validators/validateUser";

const router = Router();
const isProd = process.env.NODE_ENV === "production";

// ✅ Assign middleware arrays to variables for clarity and type safety
const signupMiddleware = withValidation(validateUser, signup, isProd);
const loginMiddleware = withValidation(validateLogin, loginUser, isProd);
const editMiddleware = withValidation(validateUser, editUser, isProd);

// ✅ Public routes
router.post("/signup", ...signupMiddleware);
router.post("/login", ...loginMiddleware);

// ✅ Protected routes
router.get("/me", verifyToken, getUserProfile);
router.put("/:id", verifyToken, ...editMiddleware);
router.delete("/:id", verifyToken, deleteUser);
router.get("/all", verifyToken, getAllUsers);

export default router;
