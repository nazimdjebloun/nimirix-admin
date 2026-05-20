"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
//import { Clock } from "lucide-react";

interface SortFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SortFilter({ value, onValueChange }: SortFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-8 bg-background/50 border-none shadow-none text-xs font-semibold focus:ring-0">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            <SelectLabel>Sort by</SelectLabel>
            <SelectItem value="newest" className="text-xs">Newest</SelectItem>
            <SelectItem value="oldest" className="text-xs">Oldest</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
