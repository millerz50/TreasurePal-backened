import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import logger from "../lib/logger";
import { hashPassword } from "../utils/hashPassword.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

//
// 📋 Get all users
//
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  logger.info("Fetching all users");

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        surname: true,
        email: true,
        avatarUrl: true,
        occupation: true,
        status: true,
        createdAt: true,
      },
    });

    logger.info(`Fetched ${users.length} users`);
    return res.json({ users });
  } catch (err: any) {
    logger.error(`Fetch all users error: ${err.message}`, err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🔐 Signup
//
export const signup = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, surname, email, password, dob, occupation, avatarUrl } =
    req.body;
  logger.info(`Signup attempt for email: ${email}`);

  try {
    if (!name || !surname || !email || !password || !dob || !occupation) {
      logger.warn(`Signup failed: Missing fields for ${email}`);
      return res.status(400).json({
        error: "Missing required fields",
        fields: { name, surname, email, password, dob, occupation },
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      logger.warn(`Signup failed: Email already registered - ${email}`);
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

    logger.info(`User created: ${user.userId}`);
    return res.status(201).json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    logger.error(`Signup error for ${email}: ${err.message}`, err);
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
  const { email, password } = req.body;
  logger.info(`Login attempt for email: ${email}`);

  try {
    if (!email || !password) {
      logger.warn("Login failed: Missing email or password");
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Login failed: Invalid credentials for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    logger.info(`Login successful for userId: ${user.userId}`);
    return res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    logger.error(`Login error for ${email}: ${err.message}`, err);
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
  const userId = (req as any).agent?.id;
  logger.info(`Fetching profile for userId: ${userId}`);

  try {
    if (!userId) {
      logger.warn("Unauthorized profile access attempt");
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
      logger.warn(`Profile not found for userId: ${userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    logger.info(`Profile fetched for userId: ${userId}`);
    return res.json({ user });
  } catch (err: any) {
    logger.error(`Profile fetch error for ${userId}: ${err.message}`, err);
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
  const { id } = req.params;
  logger.info(`Editing user: ${id}`);

  try {
    const updates = { ...req.body };

    if (!id) {
      logger.warn("Edit failed: Missing user ID");
      return res.status(400).json({ error: "Missing user ID" });
    }

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
    });

    logger.info(`User updated: ${user.userId}`);
    return res.json({
      user: {
        name: user.name,
        avatarUrl: user.avatarUrl,
        userId: user.userId,
      },
    });
  } catch (err: any) {
    logger.error(`Edit error for user ${id}: ${err.message}`, err);
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
  const { id } = req.params;
  logger.info(`Deleting user: ${id}`);

  try {
    if (!id) {
      logger.warn("Delete failed: Missing user ID");
      return res.status(400).json({ error: "Missing user ID" });
    }

    await prisma.user.delete({ where: { id } });
    logger.info(`User deleted: ${id}`);
    return res.status(204).send();
  } catch (err: any) {
    logger.error(`Delete error for user ${id}: ${err.message}`, err);
    return res.status(500).json({ error: err.message });
  }
};
