"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface PipelinePaginationProps {
  status: "CanLoadMore" | "LoadingMore" | "LoadingFirstPage" | "Exhausted";
  onLoadMore: () => void;
}

export function PipelinePagination({ status, onLoadMore }: PipelinePaginationProps) {
  if (status === "Exhausted" || status === "LoadingFirstPage") return null;

  return (
    <div className="flex justify-center py-4">
      <Button 
        variant="outline" 
        onClick={onLoadMore}
        disabled={status === "LoadingMore"}
      >
        {status === "LoadingMore" ? (
          <>
<Spinner/>
          </>
        ) : (
          "Load More"
        )}
      </Button>
    </div>
  );
}
