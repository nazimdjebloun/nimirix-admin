export const PAYMENT_STATUS_CONFIG = {
  paid: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    label: "Paid",
  },
  refunded: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    label: "Refunded",
  },
} as const

export function getPaymentStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PAYMENT_STATUS_CONFIG
  return PAYMENT_STATUS_CONFIG[normalized] ?? PAYMENT_STATUS_CONFIG.paid
}

export function getPaymentStatusColor(status: string): string {
  const s = getPaymentStatusStyles(status)
  return `${s.bg} ${s.text} ${s.border}`
}

export function getPaymentStatusLabel(status: string): string {
  return getPaymentStatusStyles(status).label
}
