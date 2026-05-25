"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortSelector } from "@/components/shared/sort-selector";
import { LimitSelector } from "@/components/shared/limit-selector";
import { cn } from "@/lib/utils";

interface PipelineFiltersProps {
  search: string;
  setSearch: (v: string) => void;
  filter: "all" | "clients" | "available";
  setFilter: (v: "all" | "clients" | "available") => void;
  sortOrder: "latest" | "oldest";
  setSortOrder: (v: "latest" | "oldest") => void;
  itemsPerPage: number;
  setItemsPerPage: (v: number) => void;
}

const filterOptions = [
  { value: "all", label: "All" },
  { value: "clients", label: "Clients" },
  { value: "available", label: "Available" },
] as const;

export function PipelineFilters({ search, setSearch, filter, setFilter, sortOrder, setSortOrder, itemsPerPage, setItemsPerPage }: PipelineFiltersProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center justify-between w-full">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 "
          /> 
        </div>
        
        <div className="flex flex-col md:flex-row  items-end justify-end gap-3 w-full lg:w-auto">
          <SortSelector value={sortOrder} onValueChange={setSortOrder} />
          <LimitSelector        
            value={itemsPerPage}
            onValueChange={setItemsPerPage}
          />
        </div>
      </div>

      <div className="flex gap-1">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter(option.value)}
            className={cn(
              filter !== option.value && "text-muted-foreground"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
