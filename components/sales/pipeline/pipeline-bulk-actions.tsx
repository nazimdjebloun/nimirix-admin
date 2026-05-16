"use client";

import * as React from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Trash2Icon, UserPlus, Hand } from "lucide-react";
import { BatchDeleteProspectDialog } from "./batch-delete-prospect-dialog";
import { BatchAssignProspectDialog } from "./batch-assign-prospect-dialog";
import { BatchClaimProspectDialog } from "./batch-claim-prospect-dialog";
import { api } from "@/convex/_generated/api";

interface PipelineBulkActionsProps {
  selectedIds: Set<Id<"clients">>;
  clients: typeof api.sales.pipeline.queries.getPipeline._returnType["page"];
  onClear: () => void;
  onBatchDeleteSuccess: () => void;
  onBatchUpdateSuccess: () => void;
  userRole?: string | undefined | null;
}

export function PipelineBulkActions({
  selectedIds,
  clients,
  onClear,
  onBatchDeleteSuccess,
  onBatchUpdateSuccess,
  userRole,
}: PipelineBulkActionsProps) {
  if (selectedIds.size === 0) return null;

  const selectedClients = clients.filter(c => selectedIds.has(c._id));
  const selectedNames = selectedClients.map(c => c.companyName);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-popover border shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-6 min-w-125">
        <div className="flex items-center gap-3 pr-6 border-r">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            {selectedIds.size}
          </div>
          <span className="text-sm font-medium">Selected</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-xs px-2"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          {(userRole === "admin" || userRole === "leadSales") && (
            <BatchAssignProspectDialog
              clientIds={Array.from(selectedIds)}
              companyNames={selectedNames}
              onSuccess={onBatchUpdateSuccess}
              trigger={
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <UserPlus className="h-4 w-4" />
                  Assign
                </Button>
              }
            />
          )}

          {(userRole === "admin" || userRole === "leadSales" || userRole === "sales") && (
            <BatchClaimProspectDialog
              clientIds={Array.from(selectedIds)}
              companyNames={selectedNames}
              onSuccess={onBatchUpdateSuccess}
              trigger={
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <Hand className="h-4 w-4" />
                  Claim
                </Button>
              }
            />
          )}

          <div className="ml-auto pl-4 border-l">
            {userRole === "admin" && (
              <BatchDeleteProspectDialog
                clientIds={Array.from(selectedIds)}
                companyNames={selectedNames}
                onSuccess={onBatchDeleteSuccess}
                trigger={
                  <Button variant="destructive" size="sm" className="h-9 gap-2">
                    <Trash2Icon className="h-4 w-4" />
                    Delete
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
