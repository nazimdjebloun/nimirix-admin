export const MEETING_TYPE_CONFIG = {
  in_office: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
    label: "In Office",
  },
  remote: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    dot: "bg-violet-500",
    label: "Remote",
  },
  client_office: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500/20",
    dot: "bg-teal-500",
    label: "Client Office",
  },
} as const;

export const MEETING_STATUS_CONFIG = {
  scheduled: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    label: "Scheduled",
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  missed: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: "Missed",
  },
  cancelled: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500/20",
    dot: "bg-gray-500",
    label: "Cancelled",
  },
} as const;

export const INTERACTION_TYPE_CONFIG = {
  call: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    border: "border-sky-500/20",
    dot: "bg-sky-500",
    label: "Call",
  },
  email: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500/20",
    dot: "bg-violet-500",
    label: "Email",
  },
} as const;

export const INTERACTION_STATUS_CONFIG = {
  scheduled: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    label: "Scheduled",
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  missed: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: "Missed",
  },
  no_response: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
    label: "No Response",
  },
} as const;

export const OUTCOME_CONFIG = {
  positive: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    label: "Positive",
  },
  neutral: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    border: "border-gray-500/20",
    dot: "bg-gray-500",
    label: "Neutral",
  },
  negative: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
    dot: "bg-rose-500",
    label: "Negative",
  },
} as const;

// Helper functions for Meeting Type
export function getMeetingTypeStyles(type: string) {
  const normalized = type.toLowerCase() as keyof typeof MEETING_TYPE_CONFIG;
  return MEETING_TYPE_CONFIG[normalized] || MEETING_TYPE_CONFIG.in_office;
}

export function getMeetingTypeColor(type: string) {
  const styles = getMeetingTypeStyles(type);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getMeetingTypeLabel(type: string) {
  return getMeetingTypeStyles(type).label;
}

// Helper functions for Meeting Status
export function getMeetingStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof MEETING_STATUS_CONFIG;
  return MEETING_STATUS_CONFIG[normalized] || MEETING_STATUS_CONFIG.scheduled;
}

export function getMeetingStatusColor(status: string) {
  const styles = getMeetingStatusStyles(status);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getMeetingStatusLabel(status: string) {
  return getMeetingStatusStyles(status).label;
}

// Helper functions for Interaction Type
export function getInteractionTypeStyles(type: string) {
  const normalized = type.toLowerCase() as keyof typeof INTERACTION_TYPE_CONFIG;
  return INTERACTION_TYPE_CONFIG[normalized] || INTERACTION_TYPE_CONFIG.call;
}

export function getInteractionTypeColor(type: string) {
  const styles = getInteractionTypeStyles(type);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getInteractionTypeLabel(type: string) {
  return getInteractionTypeStyles(type).label;
}

// Helper functions for Interaction Status
export function getInteractionStatusStyles(status: string) {
  const normalized = status.toLowerCase() as keyof typeof INTERACTION_STATUS_CONFIG;
  return INTERACTION_STATUS_CONFIG[normalized] || INTERACTION_STATUS_CONFIG.scheduled;
}

export function getInteractionStatusColor(status: string) {
  const styles = getInteractionStatusStyles(status);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getInteractionStatusLabel(status: string) {
  return getInteractionStatusStyles(status).label;
}

// Helper functions for Outcome
export function getOutcomeStyles(outcome: string) {
  const normalized = outcome.toLowerCase() as keyof typeof OUTCOME_CONFIG;
  return OUTCOME_CONFIG[normalized] || OUTCOME_CONFIG.neutral;
}

export function getOutcomeColor(outcome: string) {
  const styles = getOutcomeStyles(outcome);
  return `${styles.bg} ${styles.text} ${styles.border}`;
}

export function getOutcomeLabel(outcome: string) {
  return getOutcomeStyles(outcome).label;
}
