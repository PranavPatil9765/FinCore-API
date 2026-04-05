import { z } from "zod";
import pkg from "@prisma/client";

const { RecordType } = pkg;

export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(RecordType).optional(),
  months: z.coerce.number().int().positive().optional(),
});
