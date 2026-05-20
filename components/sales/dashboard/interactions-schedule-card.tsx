"use client"

import { useState } from "react"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  Search,
  Loader2,
  Edit2,
  ClipboardCheck,
  PhoneOff,
} from "lucide-react"
import {
  formatDateNumeric as formatDateShort,
  formatTimeOnly as formatTime,
  formatRelativeTime,
} from "@/lib/utils/date-utils"

import { UpdateInteractionStatusDialog } from "@/components/sales/dashboard/update-interaction-status-dialog"
import { EditInteractionDialog } from "@/components/sales/dashboard/edit-interaction-dialog"
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet"
import { Doc, Id } from "@/convex/_generated/dataModel"
import {
  InteractionStatusBadge,
  InteractionTypeBadge,
} from "@/components/sales/dashboard/crm-badges"
import { SortFilter } from "@/components/sales/dashboard/sort-filter"

export function InteractionsScheduleCard() {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [search, setSearch] = useState("")
  const [interactionToUpdate, setInteractionToUpdate] = useState<
    | (Doc<"clientInteractions"> & { client?: { companyName: string } | null })
    | null
  >(null)
  const [editingInteraction, setEditingInteraction] = useState<
    | (Doc<"clientInteractions"> & { client?: { companyName: string } | null })
    | null
  >(null)
  const [selectedClientId, setSelectedClientId] =
    useState<Id<"clients"> | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openClientDetail = (id: Id<"clients">) => {
    setSelectedClientId(id)
    setDetailOpen(true)
  }

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.interactions.queries.getInteractionsPaginated,
    { sortOrder, status: "scheduled" },
    { initialNumItems: 10 }
  )

  const filteredInteractions = (results || []).filter(
    (i) =>
      (i.client?.companyName || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (i.notes || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Card className="flex min-w-0 flex-1 flex-col justify-between p-1">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
            Scheduled Interactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <SortFilter
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
            />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-8 border-border/40 bg-secondary/20 pl-8 text-xs font-medium focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1 rounded-lg border border-border/40 bg-secondary/5 px-3 py-1.5">
        <div className="space-y-2 py-1">
          {filteredInteractions.map((interaction) => (
            <div
              key={interaction._id}
              className="min-w-0 space-y-2 rounded-md border bg-secondary/50 p-2.5 transition-colors hover:bg-secondary"
            >
              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 sm:flex-1">
                  <button
                    onClick={() => openClientDetail(interaction.clientId)}
                    className="block min-w-0 cursor-pointer text-left text-sm font-black tracking-tight break-words text-foreground uppercase transition-colors hover:text-primary"
                  >
                    {interaction.client?.companyName || "Client"}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                  <InteractionStatusBadge status={interaction.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setInteractionToUpdate(interaction)}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingInteraction(interaction)}
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="mt-0.5 flex w-full flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDateShort(interaction.scheduledAt)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatTime(interaction.scheduledAt)}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground capitalize">
                  {formatRelativeTime(interaction.scheduledAt)}
                </span>
              </div>

              {/* Type badge */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <InteractionTypeBadge type={interaction.type} />
              </div>

              {interaction.notes && (
                <div className="mt-1.5 border-t pt-1.5">
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    <span className="mr-1 text-[10px] font-black tracking-wider text-foreground/70 uppercase">
                      Notes:
                    </span>
                    {interaction.notes}
                  </p>
                </div>
              )}
            </div>
          ))}

          {interactionToUpdate && (
            <UpdateInteractionStatusDialog
              interaction={interactionToUpdate}
              open={!!interactionToUpdate}
              onOpenChange={(open) => !open && setInteractionToUpdate(null)}
            />
          )}

          {editingInteraction && (
            <EditInteractionDialog
              interaction={editingInteraction}
              open={!!editingInteraction}
              onOpenChange={(open) => !open && setEditingInteraction(null)}
            />
          )}

          {status === "LoadingMore" && (
            <div className="flex justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary/30" />
            </div>
          )}

          {status === "CanLoadMore" && (
            <div className="flex justify-center p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs font-black tracking-widest text-foreground uppercase hover:bg-secondary/40"
                onClick={() => loadMore(5)}
              >
                Load more
              </Button>
            </div>
          )}

          {filteredInteractions.length === 0 &&
            status !== "LoadingFirstPage" && (
              <div className="flex flex-col items-center justify-center space-y-2 py-12 text-muted-foreground">
                <PhoneOff className="h-6 w-6" />
                <p className="text-xs font-bold tracking-widest uppercase">
                  No interactions found
                </p>
              </div>
            )}
        </div>
      </ScrollArea>

      <ClientDetailSheet
        clientId={selectedClientId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </Card>
  )
}
