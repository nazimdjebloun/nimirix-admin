import { api } from "@/convex/_generated/api"

export type PaymentListFilter =
  | "all"
  | "with_balance"
  | "unpaid"
  | "partially_paid"
  | "paid_in_full"

export type PaymentListSort =
  | "highest_balance"
  | "lowest_balance"
  | "recent_payment"
  | "company"

export type PaymentClientSummary =
  typeof api.admin.payements.queries.getClientsWithPendingPayment._returnType["page"][number]
