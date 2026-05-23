"use client"

import * as React from "react"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { UserPlus, Hand } from "lucide-react"
import { BatchAssignDialog } from "./batch-assign-dialog"
import { BatchClaimDialog } from "./batch-claim-dialog"

interface ClientsBulkActionsProps {
  selectedIds: Set<Id<"clients">>
  clients: Array<{
    _id: Id<"clients">
    companyName: string
  }>
  onClear: () => void
  onBatchUpdateSuccess: () => void
  userRole?: string | undefined | null
}

export function ClientsBulkActions({
  selectedIds,
  clients,
  onClear,
  onBatchUpdateSuccess,
  userRole,
}: ClientsBulkActionsProps) {
  if (selectedIds.size === 0) return null

  const selectedClients = clients.filter((c) => selectedIds.has(c._id))
  const selectedNames = selectedClients.map((c) => c.companyName)

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in duration-300 fade-in slide-in-from-bottom-4">
      <div className="flex min-w-[320px] items-center rounded-2xl border bg-popover p-3 shadow-2xl sm:min-w-[450px]">
        <div className="flex flex-1 items-center justify-start gap-3 border-r pr-4">
          <div className="bg rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {selectedIds.size}
          </div>
          <span className="text-sm font-medium">Selected</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 pl-4">
          {(userRole === "admin" || userRole === "leadSales") && (
            <BatchAssignDialog
              clientIds={Array.from(selectedIds)}
              companyNames={selectedNames}
              onSuccess={onBatchUpdateSuccess}
              trigger={
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign
                </Button>
              }
            />
          )}

          {(userRole === "admin" ||
            userRole === "leadSales" ||
            userRole === "sales") && (
            <BatchClaimDialog
              clientIds={Array.from(selectedIds)}
              companyNames={selectedNames}
              onSuccess={onBatchUpdateSuccess}
              trigger={
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Hand className="h-4 w-4" />
                  Claim
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}
