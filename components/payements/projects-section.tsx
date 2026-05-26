"use client"

import { useState } from "react"
import { usePaginatedQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LimitSelector } from "@/components/shared/limit-selector"
import { PayementCard } from "./payement-card"

interface ProjectsSectionProps {
  clientId: Id<"clients">
  billingState: "all" | "unpaid" | "partially_paid" | "paid_in_full"
}

export function ProjectsSection({
  clientId,
  billingState,
}: ProjectsSectionProps) {
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.payements.queries.getClientProjects,
    {
      clientId,
      billingState,
    },
    { initialNumItems: itemsPerPage }
  )

  const isLoading = status === "LoadingFirstPage"

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
        <CreditCard className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/40" />
        <h3 className="text-sm font-black tracking-widest text-foreground uppercase">
          No Projects Found
        </h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {billingState === "all"
            ? "This client has no billable projects yet."
            : "No projects match the selected billing state."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div />
        <LimitSelector value={itemsPerPage} onValueChange={setItemsPerPage} />
      </div>

      {results.map((project) => (
        <PayementCard key={project._id} project={project} />
      ))}

      {status === "CanLoadMore" ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => loadMore(itemsPerPage)}
            className="rounded-xl text-xs font-bold uppercase"
          >
            Load More Projects
          </Button>
        </div>
      ) : null}
    </div>
  )
}
