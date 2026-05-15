import { z } from "zod";

export const sessionSchema = z.object({
  expiresAt: z.number(),
  token: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  userId: z.string(),
  impersonatedBy: z.string().nullable().optional(),
});

export type Session = z.infer<typeof sessionSchema>;
