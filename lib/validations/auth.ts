import { z } from "zod";
import { ROLES } from "@/lib/auth/roles";


export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

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



export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES).default("user"),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;