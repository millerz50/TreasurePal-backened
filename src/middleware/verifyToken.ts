import cookie from "cookie";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader)
    return res.status(401).json({ error: "No cookie provided" });

  const cookies = cookie.parse(cookieHeader);
  const token = cookies.auth_token;
  if (!token) return res.status(401).json({ error: "No token found" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
