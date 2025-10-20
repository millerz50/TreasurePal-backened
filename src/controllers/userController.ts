import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { hashPassword } from "../utils/hashPassword.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 🔐 Signup

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, surname, email, password, dob, occupation, avatarUrl } =
      req.body;

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

    res.status(201).json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔐 Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🔐 SSR-compatible profile fetch
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).agent.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        avatarUrl: true,
        userId: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Edit user
export const editUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
    });

    res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
