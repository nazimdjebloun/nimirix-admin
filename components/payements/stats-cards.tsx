"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatDateShortMonth } from "@/lib/utils/date-utils"
import { formatCurrency } from "./lib"

interface StatsCardsProps {
  totalProjects: number
  totalProjectValue: number
  totalPaid: number
  outstandingBalance: number
  paidProjects: number
  partiallyPaidProjects: number
  unpaidProjects: number
  lastPaymentAt?: number
}

export function StatsCards({
  totalProjects,
  totalProjectValue,
  totalPaid,
  outstandingBalance,
  paidProjects,
  partiallyPaidProjects,
  unpaidProjects,
  lastPaymentAt,
}: StatsCardsProps) {
  const stats = [
    { label: "Total Value", value: formatCurrency(totalProjectValue, "DZD") },
    { label: "Collected", value: formatCurrency(totalPaid, "DZD") },
    { label: "Outstanding", value: formatCurrency(outstandingBalance, "DZD") },
    { label: "Projects", value: totalProjects.toString() },
    {
      label: "Paid / Partial / Unpaid",
      value: `${paidProjects} / ${partiallyPaidProjects} / ${unpaidProjects}`,
    },
    {
      label: "Last Payment",
      value: lastPaymentAt
        ? formatDateShortMonth(lastPaymentAt)
        : "No payments yet",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-2xl border-border/40">
          <CardContent className="space-y-2 px-3 py-2">
            <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
              {stat.label}
            </p>
            <p className="text-lg font-black text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
        // <div
        //   key={stat.label}
        //   className="rounded-xl border bg-secondary p-0.5 shadow-xs"
        // >
        //   <p className="p-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
        //     {stat.label}
        //   </p>
        //   <div className="rounded-[11px] border bg-background p-3">
        //     <p className="text-lg font-black text-foreground">{stat.value}</p>
        //   </div>
        // </div>
      ))}
    </div>
  )
}
