import { ApiError } from "../utils/apiResponse.js";

export const authorize = (allowedRoles = []) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError("Authentication required", 401));
  }

  if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
    return next(new ApiError("Insufficient permissions", 403));
  }

  return next();
};
