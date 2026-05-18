"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SortFilter } from "@/components/sales/dashboard/sort-filter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Users, ArrowUpRight } from "lucide-react";
import { formatDateNumeric as formatDateShort } from "@/lib/utils/date-utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet";
import { Id } from "@/convex/_generated/dataModel";
import { StatusBadgeDropdown } from "@/components/sales/dashboard/client-status-update";
import { ClientStatusBadge } from "@/components/sales/dashboard/crm-badges";
interface ClientStatusTableProps {
  status: "prospect" | "initial_contact" | "negotiation" | "verbal_agreement" | "converted" | "lost" | "out_of_target";
}   

export function ClientStatusTable({ status }: ClientStatusTableProps) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { results, status: queryStatus, loadMore } = usePaginatedQuery(
    api.sales.dashboard.queries.getProspectsPaginated,
    { search, status, sortOrder, sortBy: "updatedAt" },
    { initialNumItems: 10 }
  );

  const openDetail = (clientId: Id<"clients">) => {
    setSelectedClientId(clientId);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-100 border rounded-xl bg-background/50 overflow-hidden">
        {/* Header with Sort */}
        <div className="flex justify-between items-center border-b bg-secondary/20 p-2">
          <div className="flex items-center gap-2">
            <span className="px-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              {results.length} clients
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 text-xs bg-background/50 border-input/50 focus-visible:ring-primary/20 font-medium w-40 transition-all focus:w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <SortFilter value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")} />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-border/50">
            {results.map((client) => (
              <div
                key={client._id} 
                className="group flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => openDetail(client._id)}
              >
                {/* Left: Company & Activity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-black text-xs border border-primary/20">
                    {client.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {client.companyName}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {client.activity ? (
                        <>
                          <span className="truncate max-w-30">{client.activity}</span>
                        </>
                      ) : (
                        <span className="opacity-50">No activity</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusBadgeDropdown clientId={client._id} currentStatus={client.status} />
                  </div>
                </div>
                {/* Middle: Contact Info */}
                <div className="hidden sm:flex flex-col gap-0.5 w-48 shrink-0 px-2 lg:border-l lg:border-r border-border/30 mx-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="truncate">{client.contact} {client.salesPerson?.name ? `(${client.salesPerson.name})` : ""}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>

                {/* Right: Dates & Status Context */}
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <div className="flex flex-col items-center gap-1.5">
                    <ClientStatusBadge status={client.status} />
                    <span className="text-xs font-medium text-foreground">
                      {formatDateShort(client.lastStatusChange?.createdAt || client.updatedAt)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground group-hover:text-prim  ary group-hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {queryStatus === "LoadingMore" && (
            <div className="flex justify-center p-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary/30" />
            </div>
          )}

          {queryStatus === "CanLoadMore" && (
            <div className="p-3 flex justify-center border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-black h-8 px-4 text-muted-foreground hover:bg-secondary/40 uppercase tracking-widest"
                onClick={() => loadMore(10)}
              >
                Load more
              </Button>
            </div>
          )}

          {results.length === 0 && queryStatus !== "LoadingFirstPage" && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 space-y-3">
              <div className="p-3 rounded-full bg-secondary/30">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">No clients found</p>
            </div>
          )}
        </ScrollArea>
      </div>

      <ClientDetailSheet
        clientId={selectedClientId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}