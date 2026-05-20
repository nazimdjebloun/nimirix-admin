"use client"

import { useState } from "react"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useDebounce } from "@/hooks/use-debounce"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Search, Loader2, XCircle } from "lucide-react"

interface TeamPerformanceCardProps {
  currentTime: number
}

function SectionHeading({
  title,
  accentClassName,
}: {
  title: string
  accentClassName: string
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={`h-4 w-1 rounded-full ${accentClassName}`} />
      <h2 className="text-sm font-black tracking-[0.2em] text-foreground uppercase">
        {title}
      </h2>
    </div>
  )
}

export function TeamPerformanceCard({ currentTime }: TeamPerformanceCardProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.admin.queries.getPaginatedSalesRepsPerformance,
    { currentTime, search: debouncedSearch },
    { initialNumItems: 5 }
  )

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SectionHeading
          title="Team Performance"
          accentClassName="bg-amber-500"
        />
        <div className="relative w-full sm:w-60">
          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sales reps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-lg border-border/40 bg-background/50 pl-8 text-xs focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex h-[320px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
        {/* Column Headers — 4 cols now, no Last Action */}
        <div className="grid shrink-0 grid-cols-10 border-b border-border/50 bg-muted/40 px-4 py-3 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          <div className="col-span-4">Agent</div>
          <div className="col-span-2 text-center">Leads</div>
          <div className="col-span-2 text-center">Activity</div>
          <div className="col-span-2 text-center">Converted</div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="divide-y divide-border">
            {status === "LoadingFirstPage" ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground/60">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                <p className="text-[10px] font-black tracking-widest uppercase">
                  Loading team performance...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 py-20 text-muted-foreground/40">
                <p className="text-xs font-black tracking-widest uppercase">
                  No representatives found
                </p>
                <p className="text-[10px] font-medium text-muted-foreground/60">
                  Try adjusting your search query.
                </p>
              </div>
            ) : (
              results.map((rep) => (
                <div
                  key={rep._id}
                  className="grid grid-cols-10 items-center px-4 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
                      <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                        {rep.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {rep.name}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground">
                        {rep.email}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm font-bold text-foreground">
                    {rep.activeLeads}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Badge
                      variant="secondary"
                      className="text-xs font-semibold"
                    >
                      {rep.activityCount}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      {rep.conversions}
                    </span>
                    {rep.lost > 0 && (
                      <span className="flex items-center gap-1 text-sm font-bold text-rose-400">
                        <XCircle className="h-3.5 w-3.5 shrink-0" />
                        {rep.lost}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {status === "CanLoadMore" && (
              <div className="flex justify-center border-t border-border/10 bg-muted/5 p-3">
                <button
                  onClick={() => loadMore(5)}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/20 px-4 py-1.5 text-[10px] font-black tracking-widest text-primary uppercase shadow-xs transition-colors hover:bg-primary/5 hover:text-primary/80"
                >
                  Load More
                </button>
              </div>
            )}

            {status === "LoadingMore" && (
              <div className="flex items-center justify-center gap-2 border-t border-border/10 bg-muted/5 p-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Loading reps...
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </section>
  )
}
