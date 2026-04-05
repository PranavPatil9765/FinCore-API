import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/apiResponse.js";
import { sanitizeUser } from "../../utils/helpers.js";
import { USER_STATUS } from "../../utils/constants.js";

const TOKEN_OPTIONS = {
  expiresIn: env.JWT_EXPIRES_IN,
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== USER_STATUS.ACTIVE) {
    throw new ApiError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new ApiError("Invalid credentials", 401);
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, TOKEN_OPTIONS);

  return {
    token,
    user: sanitizeUser(user),
  };
};
