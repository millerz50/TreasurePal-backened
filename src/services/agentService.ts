import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/utils/auth";
import { generateAgentId } from "../lib/utils/id";

export async function createAgent(data: {
  firstName: string;
  surname: string;
  email: string;
  nationalId: string;
  password: string;
  status?: string;
  imageUrl?: string;
}) {
  const hashedPassword = await hashPassword(data.password);
  return prisma.agent.create({
    data: {
      ...data,
      password: hashedPassword,
      agentId: generateAgentId(),
    },
  });
}

export async function updateAgent(agentId: string, updates: any) {
  return prisma.agent.update({ where: { agentId }, data: updates });
}

export async function deleteAgent(agentId: string) {
  return prisma.agent.delete({ where: { agentId } });
}

export async function getAgentByEmail(email: string) {
  return prisma.agent.findUnique({ where: { email } });
}

export async function getAgentById(agentId: string) {
  return prisma.agent.findUnique({ where: { agentId } });
}

export async function getAllAgents() {
  return prisma.agent.findMany();
}
