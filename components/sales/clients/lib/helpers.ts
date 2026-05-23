/**
 * Format currency based on standard locales.
 * Defaults to DZD (Algerian Dinar).
 */
export function formatCurrency(amount: number, currency: string = "DZD"): string {
  try {
    const symbolMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      DZD: "DA",
    };
    const symbol = symbolMap[currency.toUpperCase()] || currency;
    return `${new Intl.NumberFormat().format(amount)} ${symbol}`;
  } catch {
    return `${amount} ${currency}`;
  }
}

// ─── Project Status Config ────────────────────────────────────────────────────

const PROJECT_STATUS_CONFIG = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    label: "Pending",
  },
  in_planning: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    label: "In Planning",
  },
  in_progress: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-500",
    label: "In Progress",
  },
  delivered: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Delivered",
  },
  cancelled: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: "Cancelled",
  },
  paused: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    dot: "bg-slate-500",
    label: "Paused",
  },
} as const;

export function getProjectStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PROJECT_STATUS_CONFIG;
  return PROJECT_STATUS_CONFIG[normalized] ?? PROJECT_STATUS_CONFIG.pending;
}

export function getProjectStatusColor(status: string): string {
  const s = getProjectStatusStyles(status);
  return `${s.bg} ${s.text} ${s.border}`;
}

export function getProjectStatusLabel(status: string): string {
  return getProjectStatusStyles(status).label;
}

// ─── Project Type Config ──────────────────────────────────────────────────────

const PROJECT_TYPE_CONFIG = {
  ecommerce: { label: "E-Commerce" },
  landing_page: { label: "Landing Page" },
  erp: { label: "ERP System" },
  mobile_app: { label: "Mobile App" },
  custom: { label: "Custom Software" },
} as const;

export function getProjectTypeLabel(type: string): string {
  const normalized = type.toLowerCase() as keyof typeof PROJECT_TYPE_CONFIG;
  return PROJECT_TYPE_CONFIG[normalized]?.label ?? type;
}

// ─── Payment Method Config ────────────────────────────────────────────────────

const PAYMENT_METHOD_CONFIG = {
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
} as const;

export function getPaymentMethodStyles(method: string) {
  const normalized = method.toLowerCase() as keyof typeof PAYMENT_METHOD_CONFIG;
  return PAYMENT_METHOD_CONFIG[normalized] ?? PAYMENT_METHOD_CONFIG.cash;
}

export function getPaymentMethodColor(method: string): string {
  const s = getPaymentMethodStyles(method);
  return `${s.bg} ${s.text} ${s.border}`;
}

export function getPaymentMethodLabel(method: string): string {
  return getPaymentMethodStyles(method).label;
}
