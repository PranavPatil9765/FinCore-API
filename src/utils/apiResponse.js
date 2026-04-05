export class ApiError extends Error {
  constructor(message, status = 400, errors = null) {
    super(message);
    this.status = status;
    if (errors) {
      this.errors = errors;
    }
    Error.captureStackTrace?.(this, ApiError);
  }
}

export const successResponse = (res, data = null, message = "Success", status = 200) => {
  const payload = { status: "success", message };
  if (data !== undefined && data !== null) {
    payload.data = data;
  }
  return res.status(status).json(payload);
};
