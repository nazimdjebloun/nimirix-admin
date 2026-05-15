// lib/auth/roles.ts

export const ROLES = [
  "admin",
  "productManager",
  "leadProductManager",
  "dev",
  "leadDev",
  "designer",
  "leadDesigner",
  "qa",
  "leadQa",
  "devops",
  "leadDevops",
  "sales",
  "leadSales",
  "user",
] as const

export type Role = (typeof ROLES)[number]


export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  productManager: "Product Manager",
  leadProductManager: "Lead Product Manager",
  dev: "Developer",
  leadDev: "Lead Developer",
  designer: "Designer",
  leadDesigner: "Lead Designer",
  qa: "QA Engineer",
  leadQa: "Lead QA",
  devops: "DevOps",
  leadDevops: "Lead DevOps",
  sales: "Sales",
  leadSales: "Lead Sales",
  user: "User",
};