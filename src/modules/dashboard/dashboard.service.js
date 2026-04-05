import prisma from "../../config/db.js";
import { sanitizeRecord, toNumber } from "../../utils/helpers.js";

const buildRangeWhere = ({ startDate, endDate, category, type } = {}) => {
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

export const getSummary = async (filters = {}) => {
  const where = buildRangeWhere(filters);

  const [income, expense, categoryTotals, recentActivity] = await Promise.all([
    prisma.record.aggregate({ where: { ...where, type: "INCOME" }, _sum: { amount: true } }),
    prisma.record.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } }),
    prisma.record.groupBy({
      by: ["category", "type"],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.record.findMany({
      where,
      orderBy: { date: "desc" },
      take: 5,
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const totalIncome = toNumber(income._sum.amount);
  const totalExpenses = toNumber(expense._sum.amount);

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    categoryTotals: categoryTotals.map((entry) => ({
      category: entry.category,
      type: entry.type,
      total: toNumber(entry._sum.amount),
    })),
    recentActivity: recentActivity.map(sanitizeRecord),
  };
};

const formatPeriodKey = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const getTrends = async ({ filters = {}, months = 6 }) => {
  const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
  const startDate = filters.startDate
    ? new Date(filters.startDate)
    : new Date(new Date(endDate).setMonth(endDate.getMonth() - (months - 1)));

  const where = buildRangeWhere({ ...filters, startDate, endDate });

  const records = await prisma.record.findMany({
    where,
    orderBy: { date: "asc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const trendMap = new Map();

  const addToTrend = (key, type, amount) => {
    if (!trendMap.has(key)) {
      trendMap.set(key, { period: key, income: 0, expense: 0 });
    }
    const entry = trendMap.get(key);
    if (type === "INCOME") {
      entry.income += amount;
    } else if (type === "EXPENSE") {
      entry.expense += amount;
    }
  };

  records.forEach((record) => {
    const period = formatPeriodKey(record.date);
    addToTrend(period, record.type, toNumber(record.amount));
  });

  const normalized = [];
  const iterator = new Date(startDate);
  iterator.setUTCDate(1);

  for (let i = 0; i < months; i += 1) {
    const key = formatPeriodKey(iterator);
    const entry = trendMap.get(key) ?? { period: key, income: 0, expense: 0 };
    normalized.push({ ...entry });
    iterator.setUTCMonth(iterator.getUTCMonth() + 1);
  }

  return {
    trends: normalized,
  };
};
