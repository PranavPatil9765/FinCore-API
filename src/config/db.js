import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

const clientOptions = {
  datasources: {
    db: {
      url: env.DATABASE_URL,
    },
  },
  log: env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
};

const globalForPrisma = globalThis;

const prismaClient = (globalForPrisma.prisma ?? new PrismaClient(clientOptions));

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export default prismaClient;