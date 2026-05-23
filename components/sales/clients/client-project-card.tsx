"use client"

import { Calendar, Clock, Edit2, Trash2, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Doc } from "@/convex/_generated/dataModel"
import {
  formatDateShortMonth,
  formatDateTimeShortMonth,
} from "@/lib/utils/date-utils"
import {
  formatCurrency,
  getProjectStatusColor,
  getProjectStatusLabel,
  getProjectTypeLabel,
  getPaymentMethodLabel,
  getPaymentMethodColor,
} from "./lib/helpers"

interface ClientProjectCardProps {
  project: Doc<"projects">
  canManage: boolean
  onEdit: (project: Doc<"projects">) => void
  onDelete: (project: Doc<"projects">) => void
}

export function ClientProjectCard({
  project,
  canManage,
  onEdit,
  onDelete,
}: ClientProjectCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/40 bg-card p-4 transition-colors hover:border-border/70 sm:flex-row sm:items-stretch">
      {/* Left */}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-xs font-medium tracking-widest text-foreground uppercase">
            {project.name}
          </h4>
          <Badge
            variant="secondary"
            className="rounded px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase"
          >
            {getProjectTypeLabel(project.projectType)}
          </Badge>
          <Badge
            variant="outline"
            className={`rounded px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${getProjectStatusColor(project.status)}`}
          >
            {getProjectStatusLabel(project.status)}
          </Badge>
        </div>

        {project.scope && (
          <div className="rounded-md border border-border/30 bg-muted/40 p-2.5">
            <p className="mb-1 text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
              Scope of deliverables
            </p>
            <p className="text-xs leading-relaxed text-foreground/80">
              {project.scope}
            </p>
          </div>
        )}

        {(project.features ?? []).length > 0 && (
          <Collapsible className="overflow-hidden rounded-md border border-border/30">
            <CollapsibleTrigger className="flex w-full items-center justify-between bg-muted/40 px-2.5 py-2 text-left text-[10px] font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-muted/60">
              <span>Features ({project.features.length})</span>
              <ChevronRight className="h-3 w-3 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1 px-2.5 pt-1 pb-2.5">
                {(project.features ?? []).map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs text-foreground/80"
                  >
                    <span className="h-1 w-1 shrink-0 rounded-full bg-border" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )}

        {project.notes && (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5">
            <p className="mb-1 text-[9px] font-medium tracking-widest text-amber-600 uppercase dark:text-amber-500">
              Internal notes
            </p>
            <p className="text-xs leading-relaxed text-foreground/80">
              {project.notes}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-[11px] text-foreground/70">
            <Calendar className="h-3 w-3" />
            Due{" "}
            <strong className="font-medium text-foreground">
              {formatDateShortMonth(project.estimatedTimeline)}
            </strong>
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-foreground/70">
            <Clock className="h-3 w-3" />
            Created{" "}
            <strong className="font-medium text-foreground">
              {formatDateTimeShortMonth(project.createdAt)}
            </strong>
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t border-border/30 pt-3 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
        <div className="sm:text-right">
          <p className="mb-1 text-[9px] font-medium tracking-widest text-muted-foreground uppercase">
            Value / Budget
          </p>
          <p className="text-base font-medium text-foreground">
            {formatCurrency(project.price, "DZD")}
          </p>
          <Badge
            variant="outline"
            className={`mt-1.5 rounded px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${getPaymentMethodColor(project.paymentMethod)}`}
          >
            {getPaymentMethodLabel(project.paymentMethod)}
          </Badge>
        </div>

        {canManage && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md border border-border/30 text-muted-foreground hover:bg-accent hover:text-foreground"
              onClick={() => onEdit(project)}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md border border-border/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(project)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
