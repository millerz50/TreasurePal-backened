import { Client, Databases, ID, Query } from "node-appwrite";
import { hashPassword } from "../lib/utils/auth";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const USERS_COLLECTION = "users";
const BLOGPOSTS_COLLECTION = "blogposts";
const PROPERTIES_COLLECTION = "properties";

// ✅ Approve blog post
export async function approveBlog(postId: string, adminId: string) {
  const post = await databases.getDocument(DB_ID, BLOGPOSTS_COLLECTION, postId);
  const admin = await databases.getDocument(DB_ID, USERS_COLLECTION, adminId);

  if (admin.role !== "admin") {
    throw new Error("Only admins can approve blog posts");
  }

  return await databases.updateDocument(DB_ID, BLOGPOSTS_COLLECTION, postId, {
    approvedByAdminId: adminId,
    published: true,
    approvedAt: new Date().toISOString(),
  });
}

// ✅ Create admin account
export async function createAdminAccount(data: {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = data.email.toLowerCase();

  const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
    Query.equal("email", normalizedEmail),
  ]);

  if (existing.total > 0) {
    throw new Error("Admin already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  return await databases.createDocument(DB_ID, USERS_COLLECTION, ID.unique(), {
    firstName: data.firstName,
    surname: data.surname,
    email: normalizedEmail,
    password: hashedPassword,
    role: "admin",
    status: "active",
    emailVerified: false,
  });
}

// ✅ Remove user (any role)
export async function removeUser(userId: string) {
  return await databases.deleteDocument(DB_ID, USERS_COLLECTION, userId);
}

// ✅ Remove agent (role check optional)
export async function removeAgent(agentId: string) {
  const agent = await databases.getDocument(DB_ID, USERS_COLLECTION, agentId);
  if (agent.role !== "agent") {
    throw new Error("User is not an agent");
  }

  return await databases.deleteDocument(DB_ID, USERS_COLLECTION, agentId);
}

// ✅ Remove property
export async function removeProperty(propertyId: string) {
  return await databases.deleteDocument(
    DB_ID,
    PROPERTIES_COLLECTION,
    propertyId
  );
}
