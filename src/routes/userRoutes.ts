import { Router } from "express";
import {
  deleteUser,
  editUser,
  getUserProfile,
  loginUser,
  signup,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/verifyToken";
import { validateLogin } from "../validators/validateLogin";
import { validateUser } from "../validators/validateUser";

const router: Router = Router();

router.post("/signup", validateUser, signup);
router.post("/login", validateLogin, loginUser); // 🔥 New login route
router.get("/me", verifyToken, getUserProfile); // 🔥 SSR-compatible route
router.put("/:id", verifyToken, validateUser, editUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
