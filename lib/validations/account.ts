import { z } from "zod";

export const accountSchema = z.object({
  accountId: z.string(),
  providerId: z.string(),
  userId: z.string(),
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  accessTokenExpiresAt: z.number().nullable().optional(),
  refreshTokenExpiresAt: z.number().nullable().optional(),
  scope: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Account = z.infer<typeof accountSchema>;
