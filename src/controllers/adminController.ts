import { Request, Response } from "express";
import {
  approveBlog,
  createAdminAccount,
  removeAgent,
  removeProperty,
  removeUser,
} from "../services/adminService";

export const approveBlogPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId, adminId } = req.body;
    const post = await approveBlog(postId, adminId);
    res.json({ post });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

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

    const admin = await createAdminAccount({
      firstName,
      surname,
      email,
      password,
    });

    res.status(201).json({ admin });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await removeUser(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAgentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await removeAgent(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePropertyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    await removeProperty(parseInt(req.params.id));
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
