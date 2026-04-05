import bcrypt from "bcrypt";
import pkg from "@prisma/client";
import prisma from "../../config/db.js";
import { ApiError } from "../../utils/apiResponse.js";
import { sanitizeUser } from "../../utils/helpers.js";

const SALT_ROUNDS = 10;

const { Prisma } = pkg;
const handlePrismaError = (error) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    throw new ApiError("A user with that email already exists", 409);
  }
  throw error;
};

export const createUser = async ({ password, ...payload }) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        ...payload,
        password: hashedPassword,
      },
    });

    return sanitizeUser(user);
  } catch (error) {
    handlePrismaError(error);
  }
};

export const listUsers = async ({ filters, pagination }) => {
  const where = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const total = await prisma.user.count({ where });
  const users = await prisma.user.findMany({
    where,
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
    orderBy: { createdAt: "desc" },
  });

  return {
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
    users: users.map(sanitizeUser),
  };
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError("User not found", 404);
  }
  return sanitizeUser(user);
};

export const updateUser = async (id, data) => {
  const payload = { ...data };

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, SALT_ROUNDS);
  }

  try {
    const user = await prisma.user.update({ where: { id }, data: payload });
    return sanitizeUser(user);
  } catch (error) {
    handlePrismaError(error);
  }
};
