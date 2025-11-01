"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = createAgent;
exports.updateAgent = updateAgent;
exports.deleteAgent = deleteAgent;
exports.getAgentByEmail = getAgentByEmail;
exports.getAgentById = getAgentById;
exports.getAllAgents = getAllAgents;
const node_appwrite_1 = require("node-appwrite");
const auth_1 = require("../lib/utils/auth");
const id_1 = require("../lib/utils/id");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "TreasurePal";
const USERS_COLLECTION = "users";
// ✅ Create agent
async function createAgent(data) {
    const normalizedEmail = data.email.toLowerCase();
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
// ✅ Update agent by agentId
async function updateAgent(agentId, updates) {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("agentId", agentId),
        node_appwrite_1.Query.equal("role", "agent"),
    ]);
    if (result.total === 0) {
        throw new Error("Agent not found");
    }
    const docId = result.documents[0].$id;
    return await databases.updateDocument(DB_ID, USERS_COLLECTION, docId, updates);
}
// ✅ Delete agent by agentId
async function deleteAgent(agentId) {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("agentId", agentId),
        node_appwrite_1.Query.equal("role", "agent"),
    ]);
    if (result.total === 0) {
        throw new Error("Agent not found");
    }
    const docId = result.documents[0].$id;
    return await databases.deleteDocument(DB_ID, USERS_COLLECTION, docId);
}
// ✅ Get agent by email
async function getAgentByEmail(email) {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("email", email.toLowerCase()),
        node_appwrite_1.Query.equal("role", "agent"),
    ]);
    return result.documents[0] ?? null;
}
// ✅ Get agent by agentId
async function getAgentById(agentId) {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("agentId", agentId),
        node_appwrite_1.Query.equal("role", "agent"),
    ]);
    return result.documents[0] ?? null;
}
// ✅ Get all agents
async function getAllAgents() {
    const result = await databases.listDocuments(DB_ID, USERS_COLLECTION, [node_appwrite_1.Query.equal("role", "agent")], "100");
    return result.documents;
}
