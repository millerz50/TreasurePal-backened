"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_js_1 = require("../controllers/userController.js");
const verifyToken_1 = require("../middleware/verifyToken");
const conditionalMiddleware_1 = require("../utils/conditionalMiddleware");
const validateLogin_1 = require("../validators/validateLogin");
const validateUser_1 = require("../validators/validateUser");
const router = (0, express_1.Router)();
const isProd = process.env.NODE_ENV === "production";
// ✅ Assign middleware arrays to variables for clarity and type safety
const signupMiddleware = (0, conditionalMiddleware_1.withValidation)(validateUser_1.validateUser, userController_js_1.signup, isProd);
const loginMiddleware = (0, conditionalMiddleware_1.withValidation)(validateLogin_1.validateLogin, userController_js_1.loginUser, isProd);
const editMiddleware = (0, conditionalMiddleware_1.withValidation)(validateUser_1.validateUser, userController_js_1.editUser, isProd);
// ✅ Public routes
router.post("/signup", ...signupMiddleware);
router.post("/login", ...loginMiddleware);
// ✅ Protected routes
router.get("/me", verifyToken_1.verifyToken, userController_js_1.getUserProfile);
router.put("/:id", verifyToken_1.verifyToken, ...editMiddleware);
router.delete("/:id", verifyToken_1.verifyToken, userController_js_1.deleteUser);
router.get("/all", verifyToken_1.verifyToken, userController_js_1.getAllUsers);
exports.default = router;
