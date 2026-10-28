import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createClient> };

function createClient() {
  return new PrismaClient().$extends({
    query: {
      bid: {
        async update() {
          throw new Error("Prihvaćene ponude ne mogu da se menjaju.");
        },
        async updateMany() {
          throw new Error("Prihvaćene ponude ne mogu da se menjaju.");
        },
        async delete() {
          throw new Error("Prihvaćene ponude ne mogu da se brišu.");
        },
        async deleteMany() {
          throw new Error("Prihvaćene ponude ne mogu da se brišu.");
        },
        async upsert() {
          throw new Error("Prihvaćene ponude ne mogu da se menjaju.");
        },
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type Db = typeof prisma;
