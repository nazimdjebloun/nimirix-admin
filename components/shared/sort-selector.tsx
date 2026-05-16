"use client";

import { 
  Select, 
  SelectContent, 
  SelectGroup,
  SelectItem, 
  SelectLabel,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SortSelectorProps {
  value: "latest" | "oldest";
  onValueChange: (v: "latest" | "oldest") => void;
  className?: string;
}

export function SortSelector({ value, onValueChange, className }: SortSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as "latest" | "oldest")}>          
      <SelectTrigger className={className || "w-45"}>
        <SelectValue placeholder="Sort order" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Date Sort</SelectLabel>
          <SelectItem value="latest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
