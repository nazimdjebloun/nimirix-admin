"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SortSelector } from "@/components/shared/sort-selector";
import { LimitSelector } from "@/components/shared/limit-selector";

interface ClientsFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  sortOrder: "latest" | "oldest";
  setSortOrder: (v: "latest" | "oldest") => void;
  itemsPerPage: number;
  setItemsPerPage: (v: number) => void;
}

export function ClientsFilters({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
  itemsPerPage,
  setItemsPerPage,
}: ClientsFiltersProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between w-full">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search company or contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-col md:flex-row items-end justify-end gap-3 w-full lg:w-auto">
        <SortSelector value={sortOrder} onValueChange={setSortOrder} />
        <LimitSelector value={itemsPerPage} onValueChange={setItemsPerPage} />
      </div>
    </div>
  );
}
