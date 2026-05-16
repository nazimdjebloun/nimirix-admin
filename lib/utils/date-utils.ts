
export function formatDateNumeric(date: Date | number | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date));
}

export function formatDateTime(date: Date | number | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}





export function formatDateShortMonth(date: Date | number | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTimeShortMonth(date: Date | number | string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTimeOnly(date: Date | number | string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | number | string) {
  const timeMs = new Date(date).getTime();
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
  const absDeltaSeconds = Math.abs(deltaSeconds);
  
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units: Intl.RelativeTimeFormatUnit[] = ["second", "minute", "hour", "day", "week", "month", "year"];
  
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > absDeltaSeconds);
  const divisor = unitIndex > 0 ? cutoffs[unitIndex - 1] : 1;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  
  return rtf.format(Math.round(deltaSeconds / divisor), units[unitIndex]);
}
