import { ApiError } from "../utils/apiResponse.js";

export const validate = (schema, source = "body") => (req, res, next) => {
  const data = req[source];
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map(({ path, message }) => ({ path: path.join("."), message }));
    return next(new ApiError("Validation failed", 422, errors));
  }

  req[source] = result.data;
  return next();
};
