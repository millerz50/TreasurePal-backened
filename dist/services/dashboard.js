"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentDashboardMetrics = getAgentDashboardMetrics;
const prisma_1 = require("../lib/prisma");
async function getAgentDashboardMetrics(agentId) {
    const [totalListings, activeAgents, viewsAgg, recentActivity] = await Promise.all([
        prisma_1.prisma.property.count({ where: { agentId } }),
        prisma_1.prisma.agent.count({ where: { status: "Verified" } }),
        prisma_1.prisma.property.aggregate({
            _sum: { viewsThisWeek: true },
            where: { agentId },
        }),
        prisma_1.prisma.property.findMany({
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
