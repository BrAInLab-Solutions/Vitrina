import { prisma } from "@/lib/db";

export async function getSettings() {
  const existing = await prisma.platformSetting.findUnique({ where: { id: "default" } });
  if (existing) return existing;
  return prisma.platformSetting.create({ data: { id: "default" } });
}
