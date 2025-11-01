import { Client, Databases, ID, Query } from "node-appwrite";
import { hashPassword } from "../lib/utils/auth";
import { generateAgentId } from "../lib/utils/id";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const USERS_COLLECTION = "users";

export async function createAgent(data: {
  firstName: string;
  surname: string;
  email: string;
  nationalId: string;
  password: string;
  status?: string;
  imageUrl?: string;
}) {
  const normalizedEmail = data.email.toLowerCase();

  // 🔍 Check for existing agent by email
  const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("email", normalizedEmail),
    Query.equal("role", "agent"),
  ]);

  if (existing.total > 0) {
    throw new Error("Agent already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  return await databases.createDocument(DB_ID, USERS_COLLECTION, ID.unique(), {
    firstName: data.firstName,
    surname: data.surname,
    email: normalizedEmail,
    nationalId: data.nationalId,
    password: hashedPassword,
    agentId: generateAgentId(),
    role: "agent",
    status: data.status ?? "pending",
    imageUrl: data.imageUrl ?? null,
    emailVerified: false,
  });
}
