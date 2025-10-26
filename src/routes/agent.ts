import { Router } from "express";
import multer from "multer";
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
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

// ✅ Configure Multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Apply Multer to the register route
router.post("/register", upload.single("image"), register);

router.post("/login", login);
router.get("/me", verifyToken, getProfile);
router.put("/update/:agentId", update);
router.delete("/delete/:agentId", remove);
router.get("/all", list);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtpCode);

export default router;
