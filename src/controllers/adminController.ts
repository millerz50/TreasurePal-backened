import { Request, Response } from "express";
import logger from "../lib/logger";
import {
  approveBlog,
  createAdminAccount,
  removeAgent,
  removeProperty,
  removeUser,
} from "../services/adminService";

//
// ✅ Approve blog post
//
export const approveBlogPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId, adminId } = req.body;
  logger.info(`Admin ${adminId} attempting to approve blog post ${postId}`);

  try {
    const post = await approveBlog(postId, adminId);
    logger.info(`Blog post ${postId} approved by admin ${adminId}`);
    res.json({ post });
  } catch (err: any) {
    logger.error(`Failed to approve blog post ${postId}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

//
// ✅ Create admin account
//
export const createAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { firstName, surname, email, password } = req.body;
  logger.info(`Creating admin account for ${email}`);

  try {
    if (!firstName || !surname || !email || !password) {
      logger.warn(`Admin creation failed: Missing fields for ${email}`);
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const admin = await createAdminAccount({
      firstName,
      surname,
      email,
      password,
    });

    logger.info(`Admin account created: ${admin.id}`);
    res.status(201).json({ admin });
  } catch (err: any) {
    logger.error(`Admin creation failed for ${email}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

//
// ✅ Delete user
//
export const deleteUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.id;
  logger.info(`Deleting user: ${userId}`);

  try {
    await removeUser(userId);
    logger.info(`User deleted: ${userId}`);
    res.status(204).send();
  } catch (err: any) {
    logger.error(`Failed to delete user ${userId}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

//
// ✅ Delete agent
//
export const deleteAgentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const agentId = parseInt(req.params.id);
  logger.info(`Deleting agent: ${agentId}`);

  try {
    await removeAgent(agentId);
    logger.info(`Agent deleted: ${agentId}`);
    res.status(204).send();
  } catch (err: any) {
    logger.error(`Failed to delete agent ${agentId}: ${err.message}`, err);
    res.status(500).json({ error: err.message });
  }
};

//
// ✅ Delete property
//
export const deletePropertyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const propertyId = parseInt(req.params.id);
  logger.info(`Deleting property: ${propertyId}`);

  try {
    await removeProperty(propertyId);
    logger.info(`Property deleted: ${propertyId}`);
    res.status(204).send();
  } catch (err: any) {
    logger.error(
      `Failed to delete property ${propertyId}: ${err.message}`,
      err
    );
    res.status(500).json({ error: err.message });
  }
};
