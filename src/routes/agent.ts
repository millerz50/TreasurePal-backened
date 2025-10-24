import { Router } from "express";
import {
  getProfile,
  list,
  login,
  register,
  remove,
  sendOtp,
  update,
  verifyOtpCode,
} from "../controllers/agentController";
import { verifyToken } from "../middleware/verifyToken"; // ✅ Middleware

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", verifyToken, getProfile); // ✅ Uses AuthenticatedRequest
router.put("/update/:agentId", update);
router.delete("/delete/:agentId", remove);
router.get("/all", list);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtpCode);

export default router;
