import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { hashPassword } from "../utils/hashPassword.js"; // ✅ Ensure this exists and is compiled

const prisma = new PrismaClient();

// ✅ Approve a blog post
export const approveBlogPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId, adminId } = req.body;

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        approvedByAdminId: adminId,
        published: true,
      },
    });

    res.json({ post });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create a new admin
export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { firstName, surname, email, password } = req.body;

    if (!firstName || !surname || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(409).json({ error: "Admin already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        firstName,
        surname,
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
        status: "active",
        emailVerified: false,
      },
    });

    res.status(201).json({ admin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a user
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete an agent
export const deleteAgent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await prisma.agent.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete a property
export const deleteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await prisma.property.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
