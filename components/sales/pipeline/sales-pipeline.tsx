"use client";

import { useState } from "react";
import { usePaginatedQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PipelineHeader } from "./pipeline-header";
import { PipelineTabs } from "./pipeline-tabs";
import { PipelineFilters } from "./pipeline-filters";
import { PipelineTable } from "./pipeline-table";
import { PipelinePagination } from "./pipeline-pagination";
import { useDebounce } from "@/hooks/use-debounce";

export function SalesPipeline() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const debouncedSearch = useDebounce(search, 300);
  const { isAuthenticated } = useConvexAuth();

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.pipeline.queries.getPipeline,
    isAuthenticated
      ? {
          search: debouncedSearch,
          status: activeTab as "all" | "prospect" | "initial_contact" | "negotiation" | "verbal_agreement" | "converted" | "lost" | "out_of_target",
          sortOrder,
          pageSize: itemsPerPage,
        }
      : "skip",
    { initialNumItems: itemsPerPage }
  );

  const isLoading = status === "LoadingFirstPage";  

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <PipelineHeader />

      <PipelineTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex flex-col gap-6 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <PipelineFilters
            search={search}
            setSearch={setSearch}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
          />

        </div>

        <div className="flex flex-col gap-2 min-w-0">
          <PipelineTable clients={results} isLoading={isLoading} itemsPerPage={itemsPerPage} />

          <PipelinePagination
            status={status}
            onLoadMore={() => loadMore(itemsPerPage)}
          />
        </div>
      </div>
    </div>
  );
}
