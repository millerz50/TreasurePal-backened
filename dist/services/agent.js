"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAgent = createAgent;
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
