"use client"

import { useState } from "react"
import { useConvexAuth, usePaginatedQuery } from "convex/react"
import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import { PaymentsFilters } from "./payments-filters"
import { PaymentsSummaryCards } from "./payments-summary-cards"
import { PaymentsTable } from "./payments-table"
import type { PaymentListFilter, PaymentListSort } from "./types"

export function PaymentsIndex() {
  const { isAuthenticated } = useConvexAuth()
  const [search, setSearch] = useState("")
  const [billingFilter, setBillingFilter] = useState<PaymentListFilter>("all")
  const [sortBy, setSortBy] = useState<PaymentListSort>("highest_balance")
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.payements.queries.getClientsWithPendingPayment,
    isAuthenticated
      ? {
          search: search || undefined,
          billingState: billingFilter,
          sortBy,
        }
      : "skip",
    { initialNumItems: itemsPerPage }
  )

  const summary = results.reduce(
    (accumulator, row) => {
      accumulator.totalValue += row.totalProjectValue
      accumulator.totalPaid += row.totalPaid
      accumulator.outstanding += row.outstandingBalance
      if (row.outstandingBalance > 0) {
        accumulator.clientsWithBalance += 1
      }
      return accumulator
    },
    {
      totalValue: 0,
      totalPaid: 0,
      outstanding: 0,
      clientsWithBalance: 0,
    }
  )

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-6 md:px-0">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5">
          <Receipt className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Billing / Payments
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Track balances, collections, and paid clients in one place.
        </p>
      </div>

      <PaymentsSummaryCards
        totalValue={summary.totalValue}
        totalPaid={summary.totalPaid}
        outstanding={summary.outstanding}
        clientsWithBalance={summary.clientsWithBalance}
      />

      <PaymentsFilters
        search={search}
        billingFilter={billingFilter}
        sortBy={sortBy}
        itemsPerPage={itemsPerPage}
        onSearchChange={setSearch}
        onBillingFilterChange={setBillingFilter}
        onSortChange={setSortBy}
        onItemsPerPageChange={setItemsPerPage}
      />

      <PaymentsTable
        clients={results}
        isLoading={status === "LoadingFirstPage"}
        itemsPerPage={itemsPerPage}
      />

      {results.length > 0 && status === "CanLoadMore" ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => loadMore(itemsPerPage)}
            className="rounded-xl text-[10px] font-black uppercase"
          >
            Load More Clients
          </Button>
        </div>
      ) : null}
    </div>
  )
}
