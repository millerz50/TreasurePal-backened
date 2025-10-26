import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";

export const verifyTokenAndAuthorization: RequestHandler = (req, res, next) => {
  const agent = (req as AuthenticatedRequest).agent;
  const requestedId = req.params.id;

  if (!agent || agent.agentId !== requestedId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  next();
};
