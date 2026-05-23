"use client";

import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Hand } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BatchClaimDialogProps {
  clientIds: Id<"clients">[];
  companyNames: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BatchClaimDialog({
  clientIds,
  companyNames,
  onSuccess,
  trigger,
}: BatchClaimDialogProps) {
  const batchClaim = useMutation(api.sales.clients.mutations.batchClaimClients);
  const [isClaiming, setIsClaiming] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleClaim() {
    try {
      setIsClaiming(true);
      await batchClaim({ clientIds });
      toast.success(`${clientIds.length} clients claimed successfully`);
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to claim clients";
      toast.error(errorMessage);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Hand className="h-4 w-4" />
            Claim ({clientIds.length})
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Claim {clientIds.length} clients?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 w-full">
              <p>You are about to assign yourself as the salesperson for:</p>
              <ScrollArea className="bg-muted/50 p-3 rounded-lg text-foreground font-medium leading-relaxed h-32 w-full border">
                <div className="text-xs">{companyNames.join(", ")}</div>
              </ScrollArea>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isClaiming}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleClaim} disabled={isClaiming}>
            {isClaiming ? "Claiming..." : "Confirm Claim"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
