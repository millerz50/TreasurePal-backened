"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = require("../controllers/userController.js");
const verifyToken_1 = require("../middleware/verifyToken");
const validateLogin_1 = require("../validators/validateLogin");
const validateUser_1 = require("../validators/validateUser");
const router = (0, express_1.Router)();
router.post("/signup", validateUser_1.validateUser, userController_js_1.signup);
router.post("/login", validateLogin_1.validateLogin, userController_js_1.loginUser); // 🔥 New login route
router.get("/me", verifyToken_1.verifyToken, userController_js_1.getUserProfile); // 🔥 SSR-compatible route
router.put("/:id", verifyToken_1.verifyToken, validateUser_1.validateUser, userController_js_1.editUser);
router.delete("/:id", verifyToken_1.verifyToken, userController_js_1.deleteUser);
exports.default = router;
