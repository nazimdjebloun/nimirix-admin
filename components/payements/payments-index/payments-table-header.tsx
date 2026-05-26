"use client"

import { cn } from "@/lib/utils"

const colClasses = "flex items-center px-3 py-3"

const cols = {
  client: "min-w-52 flex-1",
  totalValue: "w-36 shrink-0",
  paid: "w-36 shrink-0",
  outstanding: "w-40 shrink-0",
  projects: "w-36 shrink-0",
  paymentStates: "w-36 shrink-0",
  lastPayment: "w-36 shrink-0",
  action: "w-24 shrink-0 justify-center",
} as const

const labels = [
  { label: "Client", className: cols.client },
  { label: "Total Value", className: cols.totalValue },
  { label: "Paid", className: cols.paid },
  { label: "Outstanding", className: cols.outstanding },
  { label: "Projects", className: cols.projects },
  { label: "Payments", className: cols.paymentStates },
  { label: "Last Payment", className: cols.lastPayment },
  { label: "Open", className: cols.action },
] as const

export function PaymentsTableHeader() {
  return (
    <div className="flex min-w-max border-b bg-accent">
      {labels.map((column) => (
        <div
          key={column.label}
          className={cn(
            colClasses,
            column.className,
            "text-xs font-bold tracking-wider text-muted-foreground uppercase whitespace-nowrap"
          )}
        >
          {column.label}
        </div>
      ))}
    </div>
  )
}

export { cols as paymentTableCols, colClasses as paymentTableColClasses }
