"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const agentController_1 = require("../controllers/agentController");
const verifyToken_1 = require("../middleware/verifyToken");
const router = (0, express_1.Router)();
// ✅ Configure Multer to store files in memory
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// ✅ Apply Multer to the register route
router.post("/register", upload.single("image"), agentController_1.register);
router.post("/login", agentController_1.login);
router.get("/me", verifyToken_1.verifyToken, agentController_1.getProfile);
router.put("/update/:agentId", agentController_1.update);
router.delete("/delete/:agentId", agentController_1.remove);
router.get("/all", agentController_1.list);
router.post("/otp/send", agentController_1.sendOtp);
router.post("/otp/verify", agentController_1.verifyOtpCode);
exports.default = router;
