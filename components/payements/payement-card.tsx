"use client"

import { useState } from "react"
import { Doc } from "@/convex/_generated/dataModel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateShortMonth } from "@/lib/utils/date-utils"
import {
  formatCurrency,
  getBillingStatusColor,
  getBillingStatusLabel,
  getPaymentMethodStyles,
  getPaymentMethodLabel,
  getProjectStatusColor,
  getProjectStatusLabel,
  getProjectTypeLabel,
} from "./lib"
import { AddPayementDialog } from "./add-payement-dialog"

interface PayementCardProject extends Doc<"projects"> {
  paidAmount: number
  refundedAmount: number
  remainingBalance: number
  billingState: "unpaid" | "partially_paid" | "paid_in_full"
  lastPaymentAt?: number
  paymentCount: number
}

interface PayementCardProps {
  project: PayementCardProject
}

export function PayementCard({ project }: PayementCardProps) {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const paymentMethodStyles = getPaymentMethodStyles(project.paymentMethod)
  const progress =
    project.price > 0
      ? Math.min((project.paidAmount / project.price) * 100, 100)
      : 0

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-black text-foreground">{project.name}</h3>
            <Badge
              variant="outline"
              className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${getBillingStatusColor(
                project.billingState
              )}`}
            >
              {getBillingStatusLabel(project.billingState)}
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-md px-2 py-1 text-[10px] font-black uppercase"
            >
              {getProjectTypeLabel(project.projectType)}
            </Badge>
            <Badge
              variant="outline"
              className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${getProjectStatusColor(
                project.status
              )}`}
            >
              {getProjectStatusLabel(project.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
            <p>
              Total: <span className="font-bold text-foreground">{formatCurrency(project.price, "DZD")}</span>
            </p>
            <p>
              Paid: <span className="font-bold text-foreground">{formatCurrency(project.paidAmount, "DZD")}</span>
            </p>
            <p>
              Remaining: <span className="font-bold text-foreground">{formatCurrency(project.remainingBalance, "DZD")}</span>
            </p>
            <p>
              Method:{" "}
              <span className={`font-bold uppercase ${paymentMethodStyles.text}`}>
                {getPaymentMethodLabel(project.paymentMethod)}
              </span>
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <p>{progress.toFixed(0)}% collected</p>
              <p>{project.paymentCount} payment(s)</p>
              <p>
                Last payment:{" "}
                <span className="font-semibold text-foreground">
                  {project.lastPaymentAt
                    ? formatDateShortMonth(project.lastPaymentAt)
                    : "No payments yet"}
                </span>
              </p>
              <p>
                Timeline:{" "}
                <span className="font-semibold text-foreground">
                  {formatDateShortMonth(project.estimatedTimeline)}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <Button
            onClick={() => setIsPaymentOpen(true)}
            size="sm"
            disabled={project.billingState === "paid_in_full"}
            className="rounded-xl text-[11px] font-black uppercase"
          >
            {project.billingState === "paid_in_full" ? "Fully Paid" : "Record Payment"}
          </Button>
          {project.refundedAmount > 0 && (
            <p className="text-[11px] text-muted-foreground">
              Refunded: {formatCurrency(project.refundedAmount, "DZD")}
            </p>
          )}
        </div>
      </div>

      {isPaymentOpen ? (
        <AddPayementDialog
          project={project}
          open={isPaymentOpen}
          onOpenChange={setIsPaymentOpen}
        />
      ) : null}
    </div>
  )
}
