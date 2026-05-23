import * as z from "zod"

export const projectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  projectType: z.enum([
    "ecommerce",
    "landing_page",
    "erp",
    "mobile_app",
    "custom",
  ]),
  price: z.coerce.number().positive("Price must be a positive number"),
  paymentMethod: z.enum(["bank_transfer", "cash", "check", "card"]),
  estimatedTimeline: z.string().min(1, "Timeline is required"),
  scope: z.string().min(10, "Scope description must be at least 10 characters"),
  notes: z.string().optional().or(z.literal("")),
})

export type ProjectSchemaType = z.infer<typeof projectSchema>
