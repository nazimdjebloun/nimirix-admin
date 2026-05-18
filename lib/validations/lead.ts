import * as z from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contact: z.string().min(2, "Contact name is required"),
  status: z.enum([
    "prospect", 
    "initial_contact", 
    "negotiation", 
    "verbal_agreement", 
    "converted", 
    "lost", 
    "out_of_target"
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(10, "Valid Phone number is required"),
  secondaryPhone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  contactPhone: z.string().optional().or(z.literal("")),
  contactEmail: z.string().optional().or(z.literal("")),
  notes: z.string().optional(),
  salesPersonId: z.string().optional(),
  nif: z.string().optional(),
  rc: z.string().optional(),
  activity: z.string().min(1, "Activity is required"),
});

export type leadSchema = z.infer<typeof leadSchema>;
