import { z } from "zod";

export const organizationInputSchema = z.object({
  kind: z.enum(["govt", "nongovt"]),
  name: z.string().min(2).max(200),
  org: z.string().max(200).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
});

export const organizationUpdateSchema = organizationInputSchema.partial();