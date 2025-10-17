import cookie from "cookie";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
export const verifyToken = (req, res, next) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        console.warn("⚠️ No cookie header found in request");
        return res
            .status(401)
            .json({ error: "Access denied. No cookie provided." });
    }
    let token;
    try {
        const cookies = cookie.parse(cookieHeader);
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
        const decoded = jwt.verify(token, JWT_SECRET);
        req.agent = decoded;
        next();
    }
    catch (err) {
        console.error("❌ Token verification failed:", err);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
