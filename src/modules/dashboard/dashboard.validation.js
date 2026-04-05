import { z } from "zod";
import { RecordType } from "@prisma/client";

export const dashboardQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(RecordType).optional(),
  months: z.coerce.number().int().positive().optional(),
});
