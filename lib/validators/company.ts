import { z } from "zod";

export const companyInputSchema = z.object({
  directoryId: z.number().int().positive(),
  name: z.string().min(2).max(200),
  website: z.string().max(500).optional().nullable(),
  type: z.string().min(1).max(200),
  location: z.string().min(1).max(500),
  area: z.string().min(1).max(100),
  thana: z.string().min(1).max(100),
  district: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  services: z.array(z.string().max(100)).optional().default([]),
  email: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  verification_status: z.string().min(1).max(200),
  job_status: z.string().min(1).max(200),
});

export const companyUpdateSchema = companyInputSchema
  .omit({ directoryId: true })
  .partial();