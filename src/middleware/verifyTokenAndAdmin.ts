import { NextFunction, Request, Response } from "express";
import { Account, Client, Databases } from "node-appwrite";
import { AuthenticatedUser } from "../types/express";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const account = new Account(client);
const databases = new Databases(client);

export async function verifyTokenAndAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await account.get(); // Authenticated user
    const userDoc = await databases.getDocument(
      "TreasurePal",
      "users",
      session.$id
    );

    if (userDoc.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.user = {
      id: session.$id,
      role: userDoc.role,
    } as AuthenticatedUser;

    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
