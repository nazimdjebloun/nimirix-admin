
export function getPipelineStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "prospect":
      return "bg-sky-500/10 text-sky-500 border-sky-500/20";
    case "initial_contact":
      return "bg-violet-500/10 text-violet-500 border-violet-500/20";
    case "negotiation":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "verbal_agreement":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
    case "converted":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "lost":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "out_of_target":
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
  }
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

