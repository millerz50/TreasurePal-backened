"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveBlog = approveBlog;
exports.createAdminAccount = createAdminAccount;
exports.removeUser = removeUser;
exports.removeAgent = removeAgent;
exports.removeProperty = removeProperty;
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/utils/auth"); // ✅ Use your shared auth utility
async function approveBlog(postId, adminId) {
    const postIdNum = parseInt(postId, 10);
    const adminIdNum = parseInt(adminId, 10);
    if (isNaN(postIdNum) || isNaN(adminIdNum)) {
        throw new Error("Invalid postId or adminId");
    }
    return prisma_1.prisma.blogPost.update({
        where: { id: postIdNum },
        data: {
            approvedByAdminId: adminIdNum,
            published: true,
        },
    });
}
async function createAdminAccount(data) {
    const normalizedEmail = data.email.toLowerCase();
    const existing = await prisma_1.prisma.admin.findUnique({
        where: { email: normalizedEmail },
    });
    if (existing) {
        throw new Error("Admin already exists");
    }
    const hashedPassword = await (0, auth_1.hashPassword)(data.password);
    return prisma_1.prisma.admin.create({
        data: {
            firstName: data.firstName,
            surname: data.surname,
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            status: "active",
            emailVerified: false,
        },
    });
}
async function removeUser(userId) {
    return prisma_1.prisma.user.delete({ where: { id: userId } });
}
async function removeAgent(agentId) {
    return prisma_1.prisma.agent.delete({ where: { id: agentId } });
}
async function removeProperty(propertyId) {
    return prisma_1.prisma.property.delete({ where: { id: propertyId } });
}
