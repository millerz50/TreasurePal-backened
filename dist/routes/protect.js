"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const verifyToken_1 = require("../middleware/verifyToken");
const verifyTokenAndAdmin_1 = require("../middleware/verifyTokenAndAdmin");
const router = (0, express_1.Router)();
router.get("/test", verifyToken_1.verifyToken, (req, res) => {
    res.send("Authenticated ✅");
});
router.get("/user/:id", auth_1.verifyTokenAndAuthorization, (req, res) => {
    res.send("Authorized ✅");
});
router.get("/admin", verifyTokenAndAdmin_1.verifyTokenAndAdmin, (req, res) => {
    res.send("Admin access ✅");
});
exports.default = router;
