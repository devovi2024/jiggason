import { z } from "zod";

export const directoryInputSchema = z.object({
  area: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  thana: z.string().min(1).max(100),
});

export const directoryUpdateSchema = directoryInputSchema.partial();