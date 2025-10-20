"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_js_1 = require("../controllers/adminController.js");
const router = (0, express_1.Router)();
router.post("/create", adminController_js_1.createAdmin); // ✅ Register the route
router.post("/approve-blog", adminController_js_1.approveBlogPost);
router.delete("/user/:id", adminController_js_1.deleteUser);
router.delete("/agent/:id", adminController_js_1.deleteAgent);
router.delete("/property/:id", adminController_js_1.deleteProperty);
exports.default = router;
