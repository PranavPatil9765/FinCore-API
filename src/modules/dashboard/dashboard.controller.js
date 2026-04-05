import { successResponse } from "../../utils/apiResponse.js";
import { getSummary, getTrends } from "./dashboard.service.js";

const parseFilters = (query) => {
  const filters = {};

  if (query.startDate) {
    filters.startDate = new Date(query.startDate);
  }

  if (query.endDate) {
    filters.endDate = new Date(query.endDate);
  }

  if (query.type) {
    filters.type = query.type;
  }

  if (query.category) {
    filters.category = query.category;
  }

  return filters;
};

export const summary = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const data = await getSummary(filters);
    return successResponse(res, data, "Dashboard summary");
  } catch (error) {
    return next(error);
  }
};

export const trends = async (req, res, next) => {
  try {
    const filters = parseFilters(req.query);
    const months = Math.max(1, Number(req.query.months) || 6);
    const data = await getTrends({ filters, months });
    return successResponse(res, data, "Dashboard trends");
  } catch (error) {
    return next(error);
  }
};
