"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveBlog = approveBlog;
exports.createAdminAccount = createAdminAccount;
exports.removeUser = removeUser;
exports.removeAgent = removeAgent;
exports.removeProperty = removeProperty;
const node_appwrite_1 = require("node-appwrite");
const auth_1 = require("../lib/utils/auth");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const USERS_COLLECTION = "users";
const BLOGPOSTS_COLLECTION = "blogposts";
const PROPERTIES_COLLECTION = "properties";
// ✅ Approve blog post
async function approveBlog(postId, adminId) {
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
async function createAdminAccount(data) {
    const normalizedEmail = data.email.toLowerCase();
    const existing = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
        node_appwrite_1.Query.equal("email", normalizedEmail),
    ]);
    if (existing.total > 0) {
        throw new Error("Admin already exists");
    }
    const hashedPassword = await (0, auth_1.hashPassword)(data.password);
    return await databases.createDocument(DB_ID, USERS_COLLECTION, node_appwrite_1.ID.unique(), {
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
async function removeUser(userId) {
    return await databases.deleteDocument(DB_ID, USERS_COLLECTION, userId);
}
// ✅ Remove agent (role check optional)
async function removeAgent(agentId) {
    const agent = await databases.getDocument(DB_ID, USERS_COLLECTION, agentId);
    if (agent.role !== "agent") {
        throw new Error("User is not an agent");
    }
    return await databases.deleteDocument(DB_ID, USERS_COLLECTION, agentId);
}
// ✅ Remove property
async function removeProperty(propertyId) {
    return await databases.deleteDocument(DB_ID, PROPERTIES_COLLECTION, propertyId);
}
