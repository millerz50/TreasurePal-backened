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
