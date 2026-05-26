"use client"

import { formatCurrency } from "../lib"

interface PaymentsSummaryCardsProps {
  totalValue: number
  totalPaid: number
  outstanding: number
  clientsWithBalance: number
}

export function PaymentsSummaryCards({
  totalValue,
  totalPaid,
  outstanding,
  clientsWithBalance,
}: PaymentsSummaryCardsProps) {
  const cards = [
    { label: "Total Value", value: formatCurrency(totalValue, "DZD") },
    { label: "Collected", value: formatCurrency(totalPaid, "DZD") },
    { label: "Outstanding", value: formatCurrency(outstanding, "DZD") },
    { label: "Clients With Balance", value: String(clientsWithBalance) },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-border/50 bg-card/60 p-4"
        >
          <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {card.label}
          </p>
          <p className="mt-2 text-lg font-black text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  )
}
