import { z } from "zod";

export const verificationSchema = z.object({
  identifier: z.string(),
  value: z.string(),
  expiresAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Verification = z.infer<typeof verificationSchema>;
