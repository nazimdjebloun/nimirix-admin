"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Search,
  Loader2,
  Edit2,
  ClipboardCheck,
  PhoneOff
} from "lucide-react";
import { formatDateNumeric as formatDateShort, formatTimeOnly as formatTime, formatRelativeTime } from "@/lib/utils/date-utils";

import { UpdateInteractionStatusDialog } from "@/components/sales/dashboard/update-interaction-status-dialog";
import { EditInteractionDialog } from "@/components/sales/dashboard/edit-interaction-dialog";
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { InteractionStatusBadge, InteractionTypeBadge } from "@/components/sales/dashboard/crm-badges";
import { SortFilter } from "@/components/sales/dashboard/sort-filter";

export function InteractionsScheduleCard() {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");
  const [interactionToUpdate, setInteractionToUpdate] = useState<(Doc<"clientInteractions"> & { client?: { companyName: string } | null }) | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<(Doc<"clientInteractions"> & { client?: { companyName: string } | null }) | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  
  const openClientDetail = (id: Id<"clients">) => {
    setSelectedClientId(id);
    setDetailOpen(true);
  };

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.interactions.queries.getInteractionsPaginated,
    { sortOrder, status: "scheduled" },
    { initialNumItems: 10 }
  );

  const filteredInteractions = (results || []).filter(i => 
    (i.client?.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (i.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="flex min-w-0 flex-col justify-between p-1 lg:h-100">
      <CardHeader className="pb-2 space-y-2">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
            Scheduled Interactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <SortFilter value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")} />
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 h-8 text-xs bg-secondary/20 border-border/40 focus-visible:ring-primary/20 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <ScrollArea className="rounded-lg border border-border/40 bg-secondary/5 px-3 py-1.5 max-lg:h-[28rem] lg:h-72">
        <div className="space-y-2 py-1">
          {filteredInteractions.map((interaction) => (
            <div key={interaction._id} className="min-w-0 space-y-2 rounded-md border bg-secondary/50 p-2.5 transition-colors hover:bg-secondary">

              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 sm:flex-1">
                  <button 
                    onClick={() => openClientDetail(interaction.clientId)}
                    className="block min-w-0 cursor-pointer break-words text-left text-sm font-black uppercase tracking-tight text-foreground transition-colors hover:text-primary"
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
                     <ClipboardCheck className="w-3.5 h-3.5" />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={() => setEditingInteraction(interaction)} 
                     className="h-7 w-7 text-muted-foreground hover:text-primary"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </Button>
                </div>
              </div>
              <div className="mt-0.5 flex w-full flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDateShort(interaction.scheduledAt)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
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
                <div className="mt-1.5 pt-1.5 border-t">
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    <span className="font-black text-foreground/70 uppercase tracking-wider text-[10px] mr-1">Notes:</span>
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
              <Loader2 className="w-4 h-4 animate-spin text-primary/30" />
            </div>
          )}

          {status === "CanLoadMore" && (
            <div className="p-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-black h-7 text-foreground hover:bg-secondary/40 uppercase tracking-widest"
                onClick={() => loadMore(5)}
              >
                Load more
              </Button>
            </div>
          )}

          {filteredInteractions.length === 0 && status !== "LoadingFirstPage" && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
              <PhoneOff className="w-6 h-6" />
              <p className="text-xs font-bold uppercase tracking-widest">No interactions found</p>
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
  );
}
