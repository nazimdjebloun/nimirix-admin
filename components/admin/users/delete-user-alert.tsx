"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2Icon } from "lucide-react";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

interface DeleteUserAlertProps {
  user: Doc<"user"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserAlert({ user, open, onOpenChange }: DeleteUserAlertProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsPending(true);
    try {
      const { error } = await authClient.admin.removeUser({ userId: user._id });
      if (error) throw new Error(error.message || "Failed to delete user");
      toast.success("User deleted successfully");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete User?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. This will permanently delete the account of{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isPending}
            className="rounded-xl font-bold transition-all"
          >
            {isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}