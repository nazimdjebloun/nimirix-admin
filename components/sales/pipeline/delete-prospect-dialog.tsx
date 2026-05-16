"use client";

import * as React from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteProspectDialogProps {
  clientId: Id<"clients">;
  companyName: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteProspectDialog({ 
  clientId, 
  companyName, 
  onSuccess,
  trigger,
  open,
  onOpenChange
}: DeleteProspectDialogProps) {
  const deleteClient = useMutation(api.sales.pipeline.mutations.deleteClient)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await deleteClient({ clientId })
      toast.success("Prospect deleted successfully")
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete prospect"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon className="size-4" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete prospect?</AlertDialogTitle> 
          <AlertDialogDescription>
                This action cannot be undone. This will permanently delete <strong>{companyName}</strong> and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
