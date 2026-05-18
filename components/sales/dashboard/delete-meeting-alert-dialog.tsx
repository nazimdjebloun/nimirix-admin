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
import { getMeetingTypeLabel } from "@/components/sales/lib/interaction-meetings";

interface DeleteMeetingAlertDialogProps {
  meeting: Doc<"clientMeetings"> & { client?: { companyName: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteMeetingAlertDialog({
  meeting,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMeetingAlertDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMeeting = useMutation(api.sales.meetings.mutations.deleteMeeting);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMeeting({ meetingId: meeting._id });
      toast.success("Meeting deleted successfully");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting meeting");
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
          <AlertDialogTitle className="font-heading text-sm font-medium text-destructive">Delete Meeting</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Are you sure you want to permanently delete this meeting?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-2 space-y-2 border-t border-b border-border/40 text-xs my-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Client:</span>
            <span className="font-bold text-foreground">{meeting.client?.companyName || "Unknown Client"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Type:</span>
            <span className="font-bold text-foreground">{getMeetingTypeLabel(meeting.type)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Date & Time:</span>
            <span className="font-bold text-foreground">
              {formatDateShort(meeting.scheduledAt)} at {formatTime(meeting.scheduledAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Location:</span>
            <span className="font-bold text-foreground truncate max-w-40">{meeting.location || (meeting.type === "remote" ? "Remote" : "N/A")}</span>
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
