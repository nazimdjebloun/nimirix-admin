export const PAYMENT_METHOD_CONFIG = {
  bank_transfer: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    label: "Bank Transfer",
  },
  cash: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    label: "Cash",
  },
  check: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    label: "Check",
  },
  card: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    label: "Credit Card",
  },
} as const

export function getPaymentMethodStyles(method: string) {
  const normalized = method.toLowerCase() as keyof typeof PAYMENT_METHOD_CONFIG
  return PAYMENT_METHOD_CONFIG[normalized] ?? PAYMENT_METHOD_CONFIG.cash
}

export function getPaymentMethodColor(method: string): string {
  const s = getPaymentMethodStyles(method)
  return `${s.bg} ${s.text} ${s.border}`
}

export function getPaymentMethodLabel(method: string): string {
  return getPaymentMethodStyles(method).label
}
