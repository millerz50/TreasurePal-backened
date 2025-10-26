"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agentController_1 = require("../controllers/agentController");
const verifyToken_1 = require("../middleware/verifyToken"); // ✅ Middleware
const router = (0, express_1.Router)();
router.post("/login", agentController_1.login);
router.post("/register", agentController_1.register);
router.get("/me", verifyToken_1.verifyToken, agentController_1.getProfile); // ✅ Uses AuthenticatedRequest
router.put("/update/:agentId", agentController_1.update);
router.delete("/delete/:agentId", agentController_1.remove);
router.get("/all", agentController_1.list);
router.post("/otp/send", agentController_1.sendOtp);
router.post("/otp/verify", agentController_1.verifyOtpCode);
exports.default = router;
