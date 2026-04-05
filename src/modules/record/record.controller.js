import { ApiError, successResponse } from "../../utils/apiResponse.js";
import { parsePagination } from "../../utils/helpers.js";
import {
  createRecord as createRecordService,
  listRecords as listRecordsService,
  getRecordById as getRecordByIdService,
  updateRecord as updateRecordService,
  deleteRecord as deleteRecordService,
} from "./record.service.js";
const buildFilters = (query) => {
  const filters = {};

  if (query.startDate) {
    filters.startDate = new Date(query.startDate);
  }

  if (query.endDate) {
    filters.endDate = new Date(query.endDate);
  }

  if (query.category) {
    filters.category = query.category;
  }

  if (query.type) {
    filters.type = query.type;
  }

  return filters;
};

export const createRecord = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user.id,
    };
    const record = await createRecordService(payload);
    return successResponse(res, record, "Record created", 201);
  } catch (error) {
    return next(error);
  }
};

export const listRecords = async (req, res, next) => {
  try {
    const filters = buildFilters(req.query);
    const pagination = parsePagination(req.query);
    const data = await listRecordsService({ filters, pagination, requester: req.user });
    return successResponse(res, data, "Records fetched");
  } catch (error) {
    return next(error);
  }
};

export const getRecord = async (req, res, next) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      throw new ApiError("Invalid identifier", 400);
    }
    const record = await getRecordByIdService({ id: recordId, requester: req.user });
    return successResponse(res, record, "Record retrieved");
  } catch (error) {
    return next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      throw new ApiError("Invalid identifier", 400);
    }
    const record = await updateRecordService(recordId, req.body);
    return successResponse(res, record, "Record updated");
  } catch (error) {
    return next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      throw new ApiError("Invalid identifier", 400);
    }
    await deleteRecordService(recordId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
