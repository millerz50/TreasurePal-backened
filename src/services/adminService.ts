import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/utils/auth"; // ✅ Use your shared auth utility

export async function approveBlog(postId: string, adminId: string) {
  const postIdNum = parseInt(postId, 10);
  const adminIdNum = parseInt(adminId, 10);

  if (isNaN(postIdNum) || isNaN(adminIdNum)) {
    throw new Error("Invalid postId or adminId");
  }

  return prisma.blogPost.update({
    where: { id: postIdNum },
    data: {
      approvedByAdminId: adminIdNum,
      published: true,
    },
  });
}

export async function createAdminAccount(data: {
  firstName: string;
  surname: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = data.email.toLowerCase();

  const existing = await prisma.admin.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    throw new Error("Admin already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.admin.create({
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

export async function removeUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}

export async function removeAgent(agentId: number) {
  return prisma.agent.delete({ where: { id: agentId } });
}

export async function removeProperty(propertyId: number) {
  return prisma.property.delete({ where: { id: propertyId } });
}
