import { Router } from "express";
import { verifyTokenAndAuthorization } from "../middleware/auth";
import { verifyToken } from "../middleware/verifyToken";
import { verifyTokenAndAdmin } from "../middleware/verifyTokenAndAdmin";

const router = Router();

router.get("/test", verifyToken, (req, res) => {
  res.send("Authenticated ✅");
});

router.get("/user/:id", verifyTokenAndAuthorization, (req, res) => {
  res.send("Authorized ✅");
});

router.get("/admin", verifyTokenAndAdmin, (req, res) => {
  res.send("Admin access ✅");
});

export default router;
