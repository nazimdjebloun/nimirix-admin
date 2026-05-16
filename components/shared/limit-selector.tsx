"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LimitSelectorProps {
  value: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  options?: number[];
}

export function LimitSelector({ 
  value = 10, 
  onValueChange, 
  disabled,
  options = [5, 10, 20, 100]
}: LimitSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      {/* <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        Show
      </span> */}
      <Select
        value={value.toString()}
        onValueChange={(val) => onValueChange(Number(val))}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 w-15 rounded-lg text-xs font-bold tracking-tight">
          <SelectValue placeholder={value.toString()} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border">
          {options.map((opt) => (
            <SelectItem key={opt} value={opt.toString()} className="text-xs font-medium">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
        per page
      </span>
    </div>
  );
}
