import { successResponse } from "../../utils/apiResponse.js";
import { login as loginService } from "./auth.service.js";

export const login = async (req, res, next) => {
  try {
    const payload = await loginService(req.body);
    return successResponse(res, payload, "Authenticated");
  } catch (error) {
    return next(error);
  }
};
