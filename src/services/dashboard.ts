import { Client, Databases, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DB_ID = "main-db";
const USERS_COLLECTION = "users";
const PROPERTIES_COLLECTION = "properties";

export async function getAgentDashboardMetrics(agentId: string) {
  const [propertyList, verifiedAgents] = await Promise.all([
    databases.listDocuments(
      DB_ID,
      PROPERTIES_COLLECTION,
      [Query.equal("agentId", agentId)],
      "100"
    ), // Adjust limit if needed

    databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal("role", "agent"), Query.equal("status", "Verified")],
      "100"
    ),
  ]);

  const totalListings = propertyList.documents.length;
  const activeAgents = verifiedAgents.documents.length;

  const viewsThisWeek = propertyList.documents.reduce(
    (sum, doc) => sum + (doc.viewsThisWeek ?? 0),
    0
  );

  const recentActivity = propertyList.documents
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
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
