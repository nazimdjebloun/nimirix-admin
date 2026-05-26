export const PROJECT_STATUS_CONFIG = {
  pending_initial_payment: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
    label: "Pending Initial Payment",
  },
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
  pending_payment: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
    label: "Pending Payment",
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
} as const

export function getProjectStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PROJECT_STATUS_CONFIG
  return PROJECT_STATUS_CONFIG[normalized] ?? PROJECT_STATUS_CONFIG.pending
}

export function getProjectStatusColor(status: string): string {
  const s = getProjectStatusStyles(status)
  return `${s.bg} ${s.text} ${s.border}`
}

export function getProjectStatusLabel(status: string): string {
  return getProjectStatusStyles(status).label
}
