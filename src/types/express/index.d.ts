import "express";

declare module "express-serve-static-core" {
  interface Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[];
  }
}
// types/express.d.ts
import { AuthenticatedUser } from "./authenticatedUser"; // adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
