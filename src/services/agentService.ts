import { Client, Databases, ID, Query } from "node-appwrite";
import { hashPassword } from "../lib/utils/auth";
import { generateAgentId } from "../lib/utils/id";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "TreasurePal";
const USERS_COLLECTION = "users";

// ✅ Create agent
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

// ✅ Update agent by agentId
export async function updateAgent(agentId: string, updates: any) {
  const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("agentId", agentId),
    Query.equal("role", "agent"),
  ]);

  if (result.total === 0) {
    throw new Error("Agent not found");
  }

  const docId = result.documents[0].$id;
  return await databases.updateDocument(
    DB_ID,
    USERS_COLLECTION,
    docId,
    updates
  );
}

// ✅ Delete agent by agentId
export async function deleteAgent(agentId: string) {
  const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("agentId", agentId),
    Query.equal("role", "agent"),
  ]);

  if (result.total === 0) {
    throw new Error("Agent not found");
  }

  const docId = result.documents[0].$id;
  return await databases.deleteDocument(DB_ID, USERS_COLLECTION, docId);
}

// ✅ Get agent by email
export async function getAgentByEmail(email: string) {
  const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("email", email.toLowerCase()),
    Query.equal("role", "agent"),
  ]);

  return result.documents[0] ?? null;
}

// ✅ Get agent by agentId
export async function getAgentById(agentId: string) {
  const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("agentId", agentId),
    Query.equal("role", "agent"),
  ]);

  return result.documents[0] ?? null;
}

// ✅ Get all agents
export async function getAllAgents() {
  const result = await databases.listDocuments(
    DB_ID,
    USERS_COLLECTION,
    [Query.equal("role", "agent")],
    "100"
  );

  return result.documents;
}
