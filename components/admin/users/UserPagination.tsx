"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserPaginationProps {
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function UserPagination({
  canPrevious,
  canNext,
  onPrevious,
  onNext,
}: UserPaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canPrevious}
        className="h-9 px-3 border-input bg-background shadow-none"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canNext}
        className="h-9 px-3 border-input bg-background shadow-none"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
