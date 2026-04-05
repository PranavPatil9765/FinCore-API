import { z } from "zod";
import { RecordType } from "@prisma/client";

const parseDate = (value) => {
  if (!value) return value;
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? value : date;
};

export const recordCreateSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.nativeEnum(RecordType),
  category: z.string().min(1),
  date: z.preprocess(parseDate, z.date()),
  notes: z.string().max(500).optional(),
});

export const recordUpdateSchema = z
  .object({
    amount: z.coerce.number().positive().optional(),
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().min(1).optional(),
    date: z.preprocess(parseDate, z.date()).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to change",
  });

export const recordListSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(RecordType).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
