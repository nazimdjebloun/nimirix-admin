"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";

interface UserFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  sortOrder: "latest" | "oldest";
  setSortOrder: (value: "latest" | "oldest") => void;
}

export function UserFilters({
  search,
  setSearch,
  role,
  setRole,
  sortOrder,
  setSortOrder,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-8 bg-background border-input h-10 shadow-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-37.5 bg-background border-input h-10 shadow-none">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent >
            <SelectGroup>
              <SelectLabel>Roles</SelectLabel>
            
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r] ?? r}
              </SelectItem>
            ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={sortOrder}
          onValueChange={(value) => setSortOrder(value as "latest" | "oldest")}
        >
          <SelectTrigger className="w-37.5 bg-background border-input h-10 shadow-none">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Order by</SelectLabel>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
