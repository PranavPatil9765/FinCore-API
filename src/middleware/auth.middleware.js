import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import prisma from "../config/db.js";
import { ApiError } from "../utils/apiResponse.js";
import { USER_STATUS } from "../utils/constants.js";
import { sanitizeUser } from "../utils/helpers.js";

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError("Authentication token missing", 401));
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const userId =
      typeof payload === "object" && payload !== null && "sub" in payload && payload.sub
        ? String(payload.sub)
        : null;

    if (!userId) {
      return next(new ApiError("Invalid token payload", 401));
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.status !== USER_STATUS.ACTIVE) {
      return next(new ApiError("Unauthorized", 401));
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new ApiError("Invalid or expired token", 401));
    }
    return next(error);
  }
};
