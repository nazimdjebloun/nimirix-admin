"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClientCrmCard } from "@/components/sales/dashboard/client-crm-card";
import { SortFilter } from "@/components/sales/dashboard/sort-filter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Search } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { getPipelineStatusStyles } from "@/components/sales/lib/helpers";

interface PipelineStageProps {
  title?: string;
  status: Doc<"clients">["status"];
  count?: number;
  color?: string;
}

export function PipelineStage({  status, count }: PipelineStageProps) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");

  const { results, status: queryStatus, loadMore } = usePaginatedQuery(
    api.sales.dashboard.queries.getProspectsPaginated,
    { search, status, sortOrder, sortBy: "updatedAt" },
    { initialNumItems: 5 }
  );

  const styles = getPipelineStatusStyles(status);

  return (
    <div className={`flex flex-col h-160 bg-card rounded-xl border border-border/80 shadow-xs overflow-hidden transition-all duration-200 hover:border-border`}>
      {/* Header */}
      <div className={`p-3 border-b border-border/40 ${styles.bg} flex justify-between items-center shrink-0`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${styles.dot} shrink-0`} />
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">
            {styles.label}
          </p>
        </div>
        <span className={`inline-flex items-center justify-center ${styles.bg} ${styles.text} ${styles.border} border text-[10px] font-black h-5 px-2 rounded-full`}>
          {results.length}{count !== undefined ? ` / ${count}` : ""}
        </span>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="flex flex-col gap-2 p-2 bg-muted/10 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-8 text-xs bg-background/50 border-border/60 focus-visible:ring-primary/20 font-medium rounded-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <SortFilter value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")} />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="min-h-0 flex-1 px-2 py-2">
        <div className="space-y-3 p-0.5">
          {results.length === 0 && queryStatus !== "LoadingFirstPage" ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 space-y-3">
              <Users className="w-8 h-8 stroke-[1.5]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-center">No prospects found</p>
            </div>
          ) : (
            results.map((client) => (
              <ClientCrmCard key={client._id} client={client} />
            ))
          )}

          {queryStatus === "LoadingMore" && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {queryStatus === "CanLoadMore" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium transition-colors"
              onClick={() => loadMore(5)}
            >
              Load more
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

