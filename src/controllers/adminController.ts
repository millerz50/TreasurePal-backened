import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

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
