"use client"

import { useState } from "react"
import { usePaginatedQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Search, Receipt, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { formatDateShortMonth } from "@/lib/utils/date-utils"
import { useUser } from "@/context/user-context"
import { SortSelector } from "@/components/shared/sort-selector"
import { LimitSelector } from "@/components/shared/limit-selector"
import {
  getPaymentMethodLabel,
  getPaymentMethodColor,
  getPaymentStatusColor,
  getPaymentStatusLabel,
  formatCurrency,
} from "./lib"

interface PaymentsSectionProps {
  clientId: Id<"clients">
}

export function PaymentsSection({ clientId }: PaymentsSectionProps) {
  const [search, setSearch] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const currentUser = useUser()
  const isAdmin = currentUser?.role === "admin"
  const refundPayment = useMutation(api.admin.payements.mutations.refundPayment)

  const handleRefund = async (paymentId: Id<"payments">) => {
    try {
      await refundPayment({ paymentId })
      toast.success("Payment refunded successfully")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to refund payment"
      toast.error(msg)
    }
  }

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.payements.queries.getClientPayments,
    {
      clientId,
      search: search || undefined,
      sortOrder: sortOrder === "latest" ? "newest" : "oldest",
    },
    { initialNumItems: itemsPerPage }
  )

  const isLoading = status === "LoadingFirstPage"
  const payments = results

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by date..."
            className="rounded-xl border-border/70 bg-card py-5 pr-4 pl-9 focus-visible:ring-1"
          />
        </div>

        <SortSelector value={sortOrder} onValueChange={setSortOrder} />
        <LimitSelector value={itemsPerPage} onValueChange={setItemsPerPage} />
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
            <Receipt className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/40" />
            <h3 className="text-sm font-black tracking-widest text-foreground uppercase">
              No Payments Recorded
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {search
                ? "No payments match your search."
                : "No payments have been recorded for this client yet."}
            </p>
          </div>
        ) : (
          <>
            {payments.map((payment) => (
              <div
                key={payment._id}
                className={`flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors sm:flex-row sm:items-center ${
                  payment.paymentStatus === "refunded"
                    ? "border-rose-500/20 opacity-60"
                    : "border-border/40 hover:border-border/70"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2 py-0.25 text-[9px] font-black tracking-wider uppercase ${getPaymentStatusColor(
                        payment.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusLabel(payment.paymentStatus)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2 py-0.25 text-[9px] font-black tracking-wider uppercase ${getPaymentMethodColor(
                        payment.paymentMethod
                      )}`}
                    >
                      {getPaymentMethodLabel(payment.paymentMethod)}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {formatDateShortMonth(payment.paymentDate)}
                    </p>
                  </div>
                  {payment.notes && (
                    <p className="text-[10px] text-muted-foreground/70 italic">
                      {payment.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-black text-foreground">
                      {formatCurrency(payment.amount, "DZD")}
                    </p>
                    {payment.taxAmount > 0 && (
                      <p className="text-[10px] text-muted-foreground">
                        Tax: {formatCurrency(payment.taxAmount, "DZD")}
                      </p>
                    )}
                  </div>
                  {isAdmin && payment.paymentStatus !== "refunded" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefund(payment._id)}
                      className="h-9 gap-1.5 rounded-xl border-rose-500/20 text-[10px] font-black tracking-wider text-rose-500 uppercase hover:bg-rose-500/10"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Refund
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {payments.length > 0 && status === "CanLoadMore" && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={() => loadMore(itemsPerPage)}
              className="rounded-xl text-xs font-bold uppercase"
            >
              Load More Payments
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
