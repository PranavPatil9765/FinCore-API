import { ApiError, successResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/helpers.js";
import { ROLES } from "../../utils/constants.js";
import {
  createUser as createUserService,
  listUsers as listUsersService,
  getUserById as getUserByIdService,
  updateUser as updateUserService,
} from "./user.service.js";

export const createUser = async (req, res, next) => {
  try {
    const payload = req.body;
    const user = await createUserService(payload);
    return successResponse(res, user, "User created", 201);
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      status: req.query.status,
    };
    const pagination = parsePagination(req.query);
    const data = await listUsersService({ filters, pagination });
    return successResponse(res, data, "Users retrieved");
  } catch (error) {
    return next(error);
  }
};

export const getProfile = (req, res) => {
  return successResponse(res, req.user, "Current user profile");
};

export const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    if (req.user.id !== userId && req.user.role !== ROLES.ADMIN) {
      throw new ApiError("Forbidden", 403);
    }
    const user = await getUserByIdService(userId);
    return successResponse(res, user, "User retrieved");
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const user = await updateUserService(userId, req.body);
    return successResponse(res, user, "User updated");
  } catch (error) {
    return next(error);
  }
};
