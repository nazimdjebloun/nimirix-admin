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
        <SelectTrigger className="h-8  bg-background/50 border-none shadow-none text-xs font-semibold focus:ring-0">
         {/* <Clock className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> */}
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            <SelectLabel>Trier par</SelectLabel>
          <SelectItem value="newest" className="text-xs">
            Plus récents
          </SelectItem>
          <SelectItem value="oldest" className="text-xs">
            Plus anciens
          </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
