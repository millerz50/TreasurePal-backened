"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = createAgent;
exports.updateAgent = updateAgent;
exports.deleteAgent = deleteAgent;
exports.getAgentByEmail = getAgentByEmail;
exports.getAgentById = getAgentById;
exports.getAllAgents = getAllAgents;
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../lib/utils/auth");
const id_1 = require("../lib/utils/id");
async function createAgent(data) {
    const hashedPassword = await (0, auth_1.hashPassword)(data.password);
    return prisma_1.prisma.agent.create({
        data: {
            ...data,
            password: hashedPassword,
            agentId: (0, id_1.generateAgentId)(),
        },
    });
}
async function updateAgent(agentId, updates) {
    return prisma_1.prisma.agent.update({ where: { agentId }, data: updates });
}
async function deleteAgent(agentId) {
    return prisma_1.prisma.agent.delete({ where: { agentId } });
}
async function getAgentByEmail(email) {
    return prisma_1.prisma.agent.findUnique({ where: { email } });
}
async function getAgentById(agentId) {
    return prisma_1.prisma.agent.findUnique({ where: { agentId } });
}
async function getAllAgents() {
    return prisma_1.prisma.agent.findMany();
}
