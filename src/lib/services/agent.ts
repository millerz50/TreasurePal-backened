import { prisma } from "../prisma";
import { hashPassword } from "../utils/auth";
import { generateAgentId } from "../utils/id";

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
