import cookie from "cookie";
import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken: RequestHandler = (req, res, next) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return res.status(401).json({ error: "No cookie provided" });
  }

  const cookies = cookie.parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) {
    return res.status(401).json({ error: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as AuthenticatedRequest).agent = decoded as JwtPayload & {
      agentId: string;
    };
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

// Optional: verifyTokenAndAdmin and verifyTokenAndAuthorization
export const verifyTokenAndAdmin: RequestHandler = (req, res, next) => {
  const agent = (req as AuthenticatedRequest).agent;
  if (agent?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
