import bcrypt from "bcrypt";
import prisma from "./db.js";
import { env } from "./env.js";

const SALT_ROUNDS = 10;

export const ensureAdminUser = async () => {
  const existingAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (existingAdmin) {
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      name: "FinCore Admin",
      email: env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.info("Created default admin user", { email: env.ADMIN_EMAIL });
  return admin;
};
