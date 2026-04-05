export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const payload = {
    status: "error",
    message,
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  return res.status(status).json(payload);
};
