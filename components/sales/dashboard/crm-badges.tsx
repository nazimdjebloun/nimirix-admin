import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getMeetingTypeStyles,
  getMeetingStatusStyles,
  getInteractionStatusStyles,
  getInteractionTypeStyles,
  getOutcomeStyles
} from "@/components/sales/lib/interaction-meetings";
import { getPipelineStatusStyles } from "@/components/sales/lib/helpers";

/**
 * Meeting Type Badge (Remote / In Office / Client Office)
 */
export function MeetingTypeBadge({ type }: { type: string }) {
  const styles = getMeetingTypeStyles(type);
  return (
    <Badge variant="outline" className={`text-xs ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </Badge>
  );
}

/**
 * Meeting Status Badge (Scheduled / Completed / Missed / Cancelled)
 */
export function MeetingStatusBadge({ status }: { status: string }) {
  const styles = getMeetingStatusStyles(status);
  return (
    <Badge variant="outline" className={`text-xs font-semibold uppercase tracking-tighter ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </Badge>
  );
}

/**
 * Interaction Status Badge (Scheduled / Completed / Missed / No Response)
 */
export function InteractionStatusBadge({ status }: { status: string }) {
  const styles = getInteractionStatusStyles(status);
  return (
    <Badge variant="outline" className={`text-xs font-semibold uppercase tracking-tighter ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </Badge>
  );
}

/**
 * Outcome Badge (Positive / Neutral / Negative)
 */
export function OutcomeBadge({ outcome }: { outcome: string }) {
  const styles = getOutcomeStyles(outcome);
  return (
    <Badge variant="outline" className={`text-xs font-semibold tracking-wide ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </Badge>
  );
}

/**
 * Interaction Type Badge (Call / Email)
 */
export function InteractionTypeBadge({ type }: { type: string }) {
  const styles = getInteractionTypeStyles(type);
  return (
    <Badge variant="outline" className={`text-xs ${styles.bg} ${styles.text} ${styles.border}`}>
      {styles.label}
    </Badge>
  );
}

// ─── Client Pipeline Status ─────────────────────────────

/**
 * Client Status Badge
 */
export function ClientStatusBadge({ status, className }: { status: string; className?: string }) {
  const config = getPipelineStatusStyles(status);
  return (
    <Badge
      variant="outline"
      className={cn(
        `text-[10px] font-black uppercase tracking-wider ${config.text} ${config.bg} ${config.border}`,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
