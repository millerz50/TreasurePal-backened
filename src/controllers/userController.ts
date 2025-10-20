import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { hashPassword } from "../utils/hashPassword.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

//
// 🔐 Signup
//
export const signup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { name, surname, email, password, dob, occupation, avatarUrl } =
      req.body;

    if (!name || !surname || !email || !password || !dob || !occupation) {
      return res.status(400).json({
        error: "Missing required fields",
        fields: { name, surname, email, password, dob, occupation },
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const user = await prisma.user.create({
      data: {
        userId: nanoid(12),
        name,
        surname,
        email: email.toLowerCase(),
        password: await hashPassword(password),
        dob: new Date(dob),
        occupation,
        status: "active",
        avatarUrl: avatarUrl || "/avatars/default.png",
      },
    });

    return res.status(201).json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    console.error("❌ Signup error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err),
    });
  }
};

//
// 🔐 Login
//
export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    console.error("❌ Login error:", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🔐 SSR-compatible profile fetch
//
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).agent?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatarUrl: true,
        userId: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (err: any) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// ✏️ Edit user
//
export const editUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
    });

    return res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    console.error("❌ Edit error:", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🗑️ Delete user
//
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return res.status(500).json({ error: err.message });
  }
};
