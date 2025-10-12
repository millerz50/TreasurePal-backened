import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// 🧬 User ID Generator
export const generateUserId = (): string => {
  const prefix = "AG";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numericPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomPart}-${numericPart}`;
};

// ✅ Create Agent
export async function createAgent(data: {
  firstName: string;
  surname: string;
  email: string;
  nationalId: string;
  password: string;
  status?: string;
  imageUrl?: string;
}) {
  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.agent.create({
    data: {
      ...data,
      password: hashedPassword,
      userId: generateUserId(),
    },
  });
}

// ✅ Compare Password
export async function comparePassword(
  candidate: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(candidate, hashed);
}
