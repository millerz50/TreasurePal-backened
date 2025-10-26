// src/types/AuthenticatedRequest.ts
import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  agent?: JwtPayload & { agentId: string; role?: string };
}
