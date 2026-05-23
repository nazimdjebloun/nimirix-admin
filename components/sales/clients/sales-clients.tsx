"use client";

import { useState } from "react";
import { usePaginatedQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClientsFilters } from "./clients-filters";
import { ClientsTable } from "./clients-table";
import { PipelinePagination } from "@/components/sales/pipeline/pipeline-pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { Users } from "lucide-react";

export function SalesClients() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const debouncedSearch = useDebounce(search, 300);
  const { isAuthenticated } = useConvexAuth();

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.clients.queries.getConvertedClientsPaginated,
    isAuthenticated
      ? {
          search: debouncedSearch,
          sortOrder: sortOrder === "latest" ? "newest" : "oldest",
        }
      : "skip",
    { initialNumItems: itemsPerPage }
  );

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-black uppercase tracking-tight">
            Converted Clients Directory
          </h1>
        </div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Manage contracts, project timelines, and shared sales collaborations
        </p>
      </div>

      <div className="flex flex-col gap-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <ClientsFilters
            search={search}
            setSearch={setSearch}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <ClientsTable
            clients={results || []}
            isLoading={isLoading}
            itemsPerPage={itemsPerPage}
          />

          <PipelinePagination
            status={status}
            onLoadMore={() => loadMore(itemsPerPage)}
          />
        </div>
      </div>
    </div>
  );
}
