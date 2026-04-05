import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env.js";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const clientOptions = {
  adapter,
  log: env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
};

const globalForPrisma = globalThis;

const prismaClient = globalForPrisma.prisma ?? new PrismaClient(clientOptions);

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prismaClient;
}

export default prismaClient;
