"use client"

import * as React from "react"
import { format, parseISO } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  ariaInvalid?: boolean;
  className?: string;
  id?: string;
}

export function DatePicker({ value, onChange, ariaInvalid, className, id }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    try {
      const parsed = parseISO(value);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (onChange) {
      if (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange("");
      }
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id={id}
          className={cn(
            // font-normal bg-secondary/20 border-border/40 focus-visible:ring-primary/20
            "w-full justify-start text-left ",
            !value && "text-muted-foreground",
            ariaInvalid && "border-destructive focus-visible:ring-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          {selectedDate ? format(selectedDate, "PPP") : "Choisir une date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
