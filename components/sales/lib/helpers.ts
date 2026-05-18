const PIPELINE_STATUS_CONFIG = {
  prospect: {
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
    label: "Prospect",
  },
  initial_contact: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    border: "border-violet-500/20",
    dot: "bg-violet-500",
    label: "Initial Contact",
  },
  negotiation: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    label: "Negotiation",
  },
  verbal_agreement: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
    dot: "bg-teal-500",
    label: "Verbal Agreement",
  },
  converted: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Converted",
  },
  lost: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: "Lost",
  },
  out_of_target: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500/20",
    dot: "bg-gray-500",
    label: "Out of Target",
  },
} as const;

export function getPipelineStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PIPELINE_STATUS_CONFIG;
  return PIPELINE_STATUS_CONFIG[normalized] || PIPELINE_STATUS_CONFIG.out_of_target;
}

export function getPipelineStatusColor(status: string) {
  const styles = getPipelineStatusStyles(status);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getPipelinePriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case "low":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "medium":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "high":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
  }
}

export function getPipelineStatusLabel(status: string) {
  const styles = getPipelineStatusStyles(status);
  const normalized = status.toLowerCase() as keyof typeof PIPELINE_STATUS_CONFIG;
  if (!(normalized in PIPELINE_STATUS_CONFIG)) {
    return status;
  }
  return styles.label;
}

export function getPipelineStatusTextColor(status: string) {
  return getPipelineStatusStyles(status).text;
}


