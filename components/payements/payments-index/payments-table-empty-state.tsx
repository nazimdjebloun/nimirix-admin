"use client"

import { CreditCard } from "lucide-react"

export function PaymentsTableEmptyState() {
  return (
    <div className="flex h-48 items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-black text-foreground">
          No billing records found
        </p>
        <p className="text-xs text-muted-foreground">
          Try a different search or billing filter.
        </p>
      </div>
    </div>
  )
}
