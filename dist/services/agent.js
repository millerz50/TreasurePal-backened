"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = createAgent;
const node_appwrite_1 = require("node-appwrite");
const auth_1 = require("../lib/utils/auth");
const id_1 = require("../lib/utils/id");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const USERS_COLLECTION = "users";
async function createAgent(data) {
    const normalizedEmail = data.email.toLowerCase();
    // 🔍 Check for existing agent by email
    const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("email", normalizedEmail),
        node_appwrite_1.Query.equal("role", "agent"),
    ]);
    if (existing.total > 0) {
        throw new Error("Agent already exists");
    }
    const hashedPassword = await (0, auth_1.hashPassword)(data.password);
    return await databases.createDocument(DB_ID, USERS_COLLECTION, node_appwrite_1.ID.unique(), {
        firstName: data.firstName,
        surname: data.surname,
        email: normalizedEmail,
        nationalId: data.nationalId,
        password: hashedPassword,
        agentId: (0, id_1.generateAgentId)(),
        role: "agent",
        status: data.status ?? "pending",
        imageUrl: data.imageUrl ?? null,
        emailVerified: false,
    });
}
