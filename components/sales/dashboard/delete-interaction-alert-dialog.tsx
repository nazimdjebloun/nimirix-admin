"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { formatDateNumeric as formatDateShort, formatTimeOnly as formatTime } from "@/lib/utils/date-utils";
import { getInteractionTypeLabel } from "@/components/sales/lib/interaction-meetings";

interface DeleteInteractionAlertDialogProps {
  interaction: Doc<"clientInteractions"> & { client?: { companyName: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteInteractionAlertDialog({
  interaction,
  open,
  onOpenChange,
  onSuccess,
}: DeleteInteractionAlertDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteInteraction = useMutation(api.sales.interactions.mutations.deleteInteraction);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteInteraction({ interactionId: interaction._id });
      toast.success("Interaction deleted successfully");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting interaction");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-4 w-4" />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading text-sm font-medium text-destructive">Delete Interaction</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Are you sure you want to permanently delete this interaction?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-2 space-y-2 border-t border-b border-border/40 text-xs my-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Client:</span>
            <span className="font-bold text-foreground">{interaction.client?.companyName || "Unknown Client"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Type:</span>
            <span className="font-bold text-foreground">{getInteractionTypeLabel(interaction.type)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Date & Time:</span>
            <span className="font-bold text-foreground">
              {formatDateShort(interaction.scheduledAt)} at {formatTime(interaction.scheduledAt)}
            </span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner className="mr-2" /> : null}
            Confirm Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
