import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  emailVerified: z.boolean(),
  image: z.string().url().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  userId: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  banned: z.boolean().nullable().optional(),
  banReason: z.string().nullable().optional(),
  banExpires: z.number().nullable().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
});

export type User = z.infer<typeof userSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;


import { ROLES } from "@/lib/auth/roles";

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES).default("user"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;