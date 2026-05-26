export const BILLING_STATUS_CONFIG = {
  unpaid: {
    label: "Unpaid",
    badgeClassName:
      "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  partially_paid: {
    label: "Partially Paid",
    badgeClassName:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  paid_in_full: {
    label: "Paid in Full",
    badgeClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
} as const

export function getBillingStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof BILLING_STATUS_CONFIG
  return BILLING_STATUS_CONFIG[normalized] ?? BILLING_STATUS_CONFIG.unpaid
}

export function getBillingStatusLabel(status: string) {
  return getBillingStatusStyles(status).label
}

export function getBillingStatusColor(status: string) {
  return getBillingStatusStyles(status).badgeClassName
}
