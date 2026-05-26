"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PaymentsTableEmptyState } from "./payments-table-empty-state"
import { PaymentsTableHeader } from "./payments-table-header"
import { PaymentsTableRow } from "./payments-table-row"
import { PaymentsTableSkeleton } from "./payments-table-skeleton"
import type { PaymentClientSummary } from "./types"

interface PaymentsTableProps {
  clients: PaymentClientSummary[]
  isLoading: boolean
  itemsPerPage: number
}

export function PaymentsTable({
  clients,
  isLoading,
  itemsPerPage,
}: PaymentsTableProps) {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-border/50 bg-card/40">
      <ScrollArea type="always" className="w-full">
        <PaymentsTableHeader />

        <div className="min-w-max">
          {isLoading ? (
            <PaymentsTableSkeleton rows={itemsPerPage} />
          ) : clients.length === 0 ? (
            <PaymentsTableEmptyState />
          ) : (
            clients.map((client) => (
              <PaymentsTableRow key={client._id} client={client} />
            ))
          )}
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
