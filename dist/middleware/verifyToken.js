"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenAndAdmin = exports.verifyToken = void 0;
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const verifyToken = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        return res.status(401).json({ error: "No cookie provided" });
    }
    const cookies = cookie_1.default.parse(cookieHeader);
    const token = cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "No token found" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.agent = decoded;
        next();
    }
    catch (err) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.verifyToken = verifyToken;
// Optional: verifyTokenAndAdmin and verifyTokenAndAuthorization
const verifyTokenAndAdmin = (req, res, next) => {
    const agent = req.agent;
    if (agent?.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    next();
};
exports.verifyTokenAndAdmin = verifyTokenAndAdmin;
