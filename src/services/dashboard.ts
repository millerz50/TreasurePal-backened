import { prisma } from "../lib/prisma";

export async function getAgentDashboardMetrics(agentId: string) {
  const [totalListings, activeAgents, viewsAgg, recentActivity] =
    await Promise.all([
      prisma.property.count({ where: { agentId } }),
      prisma.agent.count({ where: { status: "Verified" } }),
      prisma.property.aggregate({
        _sum: { viewsThisWeek: true },
        where: { agentId },
      }),
      prisma.property.findMany({
        where: { agentId },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { title: true, createdAt: true },
      }),
    ]);

  const activityFeed = recentActivity.map((listing) => ({
    type: "listing",
    message: `New listing added: “${listing.title}”`,
  }));

  return {
    totalListings,
    activeAgents,
    viewsThisWeek: viewsAgg._sum.viewsThisWeek || 0,
    recentActivity: activityFeed,
  };
}
