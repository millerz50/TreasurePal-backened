"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentDashboardMetrics = getAgentDashboardMetrics;
const node_appwrite_1 = require("node-appwrite");
const client = new node_appwrite_1.Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new node_appwrite_1.Databases(client);
const DB_ID = "main-db";
const USERS_COLLECTION = "users";
const PROPERTIES_COLLECTION = "properties";
async function getAgentDashboardMetrics(agentId) {
    const [propertyList, verifiedAgents] = await Promise.all([
        databases.listDocuments(DB_ID, PROPERTIES_COLLECTION, [node_appwrite_1.Query.equal("agentId", agentId)], "100"), // Adjust limit if needed
        databases.listDocuments(DB_ID, USERS_COLLECTION, [node_appwrite_1.Query.equal("role", "agent"), node_appwrite_1.Query.equal("status", "Verified")], "100"),
    ]);
    const totalListings = propertyList.documents.length;
    const activeAgents = verifiedAgents.documents.length;
    const viewsThisWeek = propertyList.documents.reduce((sum, doc) => sum + (doc.viewsThisWeek ?? 0), 0);
    const recentActivity = propertyList.documents
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3)
        .map((listing) => ({
        type: "listing",
        message: `New listing added: “${listing.title}”`,
    }));
    return {
        totalListings,
        activeAgents,
        viewsThisWeek,
        recentActivity,
    };
}
