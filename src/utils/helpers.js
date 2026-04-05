import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "./constants.js";

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
};

export const sanitizeRecord = (record) => {
  if (!record) return null;
  const { amount, date, user, ...rest } = record;
  const sanitized = {
    ...rest,
    amount: Number(amount),
    date: date.toISOString(),
  };
  if (user) {
    sanitized.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
  return sanitized;
};

export const parsePagination = (query) => {
  const page = Number(query.page) || DEFAULT_PAGE;
  const limit = Number(query.limit) || DEFAULT_LIMIT;
  return {
    page: Math.max(1, page),
    limit: Math.min(MAX_LIMIT, Math.max(1, limit)),
  };
};

export const toNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
};
