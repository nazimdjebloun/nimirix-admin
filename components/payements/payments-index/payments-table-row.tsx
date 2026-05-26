"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDateShortMonth } from "@/lib/utils/date-utils"
import {
  formatCurrency,
  getBillingStatusColor,
  getBillingStatusLabel,
} from "../lib"
import {
  paymentTableColClasses,
  paymentTableCols,
} from "./payments-table-header"
import type { PaymentClientSummary } from "./types"

interface PaymentsTableRowProps {
  client: PaymentClientSummary
}

export function PaymentsTableRow({ client }: PaymentsTableRowProps) {
  const router = useRouter()

  return (
    <div
      className="flex cursor-pointer items-center border-b transition-colors last:border-0 hover:bg-accent/30"
      onClick={() => router.push(`/payements/${client.clientId}`)}
    >
      <div className={cn(paymentTableColClasses, paymentTableCols.client)}>
        <div className="space-y-1">
          <p className="font-black text-foreground">{client.companyName}</p>
          <p className="text-[11px] text-muted-foreground">{client.contact}</p>
          <p className="text-[11px] text-muted-foreground">{client.email}</p>
        </div>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.totalValue)}>
        <div className="flex flex-col items-center gap-2 text-center">
          <Badge
            variant="outline"
            className={`rounded-md px-2 py-1 text-[10px] font-black uppercase ${getBillingStatusColor(
              client.billingState
            )}`}
          >
            {getBillingStatusLabel(client.billingState)}
          </Badge>
          <p className="text-xs font-semibold text-foreground">
            {formatCurrency(client.totalProjectValue, "DZD")}
          </p>
        </div>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.paid)}>
        <p className="text-xs font-semibold text-foreground">
          {formatCurrency(client.totalPaid, "DZD")}
        </p>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.outstanding)}>
        <p className="text-xs font-black text-foreground">
          {formatCurrency(client.outstandingBalance, "DZD")}
        </p>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.projects)}>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="secondary"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.totalProjects} total
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.completedProjects} completed
          </Badge>
          <Badge
            variant="secondary"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.ongoingProjects} ongoing
          </Badge>
        </div>
      </div>

      <div
        className={cn(paymentTableColClasses, paymentTableCols.paymentStates)}
      >
        <div className="flex flex-col gap-1.5">
          <Badge
            variant="outline"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.paidProjects} paid
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.partiallyPaidProjects} partial
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md px-2 py-1 text-[10px] font-bold"
          >
            {client.unpaidProjects} unpaid
          </Badge>
        </div>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.lastPayment)}>
        <p className="text-[11px] font-medium text-foreground">
          {client.lastPaymentAt
            ? formatDateShortMonth(client.lastPaymentAt)
            : "No payments yet"}
        </p>
      </div>

      <div className={cn(paymentTableColClasses, paymentTableCols.action)}>
        <Button
          variant="outline"
          size="sm"
          onClick={(event) => {
            event.stopPropagation()
            router.push(`/payements/${client.clientId}`)
          }}
          className="rounded-xl text-[10px] font-black uppercase"
        >
          View
        </Button>
      </div>
    </div>
  )
}
