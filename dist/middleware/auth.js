"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const verifyToken = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        console.warn("⚠️ No cookie header found in request");
        return res
            .status(401)
            .json({ error: "Access denied. No cookie provided." });
    }
    let token;
    try {
        const cookies = cookie_1.default.parse(cookieHeader);
        token = cookies.auth_token;
    }
    catch (err) {
        console.error("❌ Failed to parse cookies:", err);
        return res.status(400).json({ error: "Malformed cookie header" });
    }
    if (!token) {
        return res
            .status(401)
            .json({ error: "Access denied. No token found in cookie." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.agent = decoded;
        next();
    }
    catch (err) {
        console.error("❌ Token verification failed:", err);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.verifyToken = verifyToken;
