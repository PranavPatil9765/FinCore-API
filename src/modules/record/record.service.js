import { ApiError } from "../../utils/apiResponse.js";
import prisma from "../../config/db.js";
import { sanitizeRecord } from "../../utils/helpers.js";
import { ROLES } from "../../utils/constants.js";

const buildFilters = ({ startDate, endDate, category, type }) => {
  const where = {};

  if (startDate || endDate) {
    where.date = {};

    if (startDate) {
      where.date.gte = startDate;
    }

    if (endDate) {
      where.date.lte = endDate;
    }
  }

  if (category) {
    where.category = category;
  }

  if (type) {
    where.type = type;
  }

  return where;
};

export const createRecord = async (payload) => {
  const record = await prisma.record.create({
    data: payload,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  return sanitizeRecord(record);
};

export const listRecords = async ({ filters, pagination, requester }) => {
  const where = {
    ...buildFilters(filters),
  };

  if (requester.role === ROLES.VIEWER) {
    where.userId = requester.id;
  }

  const total = await prisma.record.count({ where });
  const records = await prisma.record.findMany({
    where,
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
    orderBy: { date: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return {
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
    },
    records: records.map(sanitizeRecord),
  };
};

export const getRecordById = async ({ id, requester }) => {
  const record = await prisma.record.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!record) {
    throw new ApiError("Record not found", 404);
  }

  if (requester.role === ROLES.VIEWER && record.userId !== requester.id) {
    throw new ApiError("Forbidden", 403);
  }

  return sanitizeRecord(record);
};

export const updateRecord = async (id, data) => {
  const record = await prisma.record.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return sanitizeRecord(record);
};

export const deleteRecord = async (id) => {
  await prisma.record.delete({ where: { id } });
};
