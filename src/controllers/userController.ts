import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import {
  Account,
  Client,
  Databases,
  Permission,
  Query,
  Role,
} from "node-appwrite";
import { logger } from "../lib/logger";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const account = new Account(client);
const databases = new Databases(client);

const JWT_SECRET: string = process.env.JWT_SECRET || "supersecretkey";
const DB_ID = "main-db";
const USERS_COLLECTION = "users";

interface TypedUser {
  $id: string;
  role: string;
  password: string;
  [key: string]: any;
}

//
// 📋 Get all users (admin only)
//
export const getAllUsers = async (req: Request, res: Response) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Only admins can view all users." });
  }

  try {
    const users = await databases.listDocuments(DB_ID, USERS_COLLECTION);
    return res.json({ users: users.documents });
  } catch (err: any) {
    logger.error("Error fetching users", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🔐 Signup (admin-only for role=admin)
//
export const signup = async (req: Request, res: Response) => {
  const {
    name,
    surname,
    email,
    password,
    dob,
    occupation,
    avatarUrl,
    role = "user",
    nationalId,
    agentCode,
    imageUrl,
  } = req.body;

  try {
    if (!name || !surname || !email || !password || !dob || !occupation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role === "admin" && req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admins can create other admins." });
    }

    const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("email", email.toLowerCase()),
    ]);
    if (existing.total > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const userId = nanoid(12);

    const user = await databases.createDocument(
      DB_ID,
      USERS_COLLECTION,
      "unique()",
      {
        userId,
        name,
        surname,
        email: email.toLowerCase(),
        password: hashed,
        dob,
        occupation,
        status: "active",
        role,
        avatarUrl: avatarUrl || "/avatars/default.png",
        nationalId,
        agentCode,
        imageUrl,
        emailVerified: false,
        blogLikes: [],
        propertyLikes: [],
      },
      [
        Permission.read(Role.user(req.user?.id || "admin")),
        Permission.write(Role.user(req.user?.id || "admin")),
      ]
    );

    return res.status(201).json({ user });
  } catch (err: any) {
    logger.error("Signup error", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🔐 Login
//
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("email", email.toLowerCase()),
    ]);
    const user = result.documents[0] as unknown as TypedUser;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.$id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.json({ user });
  } catch (err: any) {
    logger.error("Login error", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🔍 Get profile
//
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      req.user?.id!
    );
    return res.json({ user });
  } catch (err: any) {
    logger.error("Profile fetch error", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// ✏️ Edit user (self or admin)
//
export const editUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Partial<TypedUser> = { ...req.body };

  try {
    if (req.user?.id !== id && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized to edit this user." });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await databases.updateDocument(
      DB_ID,
      USERS_COLLECTION,
      id,
      updates
    );
    return res.json({ user });
  } catch (err: any) {
    logger.error("Edit error", err);
    return res.status(500).json({ error: err.message });
  }
};

//
// 🗑️ Delete user (admin only)
//
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete users." });
    }

    await databases.deleteDocument(DB_ID, USERS_COLLECTION, id);
    return res.status(204).send();
  } catch (err: any) {
    logger.error("Delete error", err);
    return res.status(500).json({ error: err.message });
  }
};
export const approveBlogPost = async (req: Request, res: Response) => {
  const { postId } = req.body;

  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Only admins can approve blog posts." });
  }

  try {
    const updated = await databases.updateDocument(
      "main-db",
      "blogposts",
      postId,
      {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: req.user.id,
      }
    );

    return res.json({ post: updated });
  } catch (err: any) {
    logger.error("Blog approval error", err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user?.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Only admins can delete properties." });
  }

  try {
    await databases.deleteDocument("main-db", "properties", id);
    return res.status(204).send();
  } catch (err: any) {
    logger.error("Property delete error", err);
    return res.status(500).json({ error: err.message });
  }
};
