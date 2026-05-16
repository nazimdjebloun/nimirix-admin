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
import { ScrollArea } from "@/components/ui/scroll-area"

interface BatchDeleteProspectDialogProps {
  clientIds: Id<"clients">[];
  companyNames: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BatchDeleteProspectDialog({ 
  clientIds, 
  companyNames, 
  onSuccess,
  trigger 
}: BatchDeleteProspectDialogProps) {
  const batchDelete = useMutation(api.sales.pipeline.mutations.batchDeleteClients)
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    try {
      setIsDeleting(true)
      await batchDelete({ clientIds })
      toast.success(`${clientIds.length} prospects deleted`)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm" className="h-9 gap-2">
            <Trash2Icon className="h-4 w-4" />
            Delete ({clientIds.length})
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent  className="" >  
        <AlertDialogHeader className="flex flex-col items-center justify-center text-center sm:place-items-center! sm:text-center!">
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive text-center">
            <Trash2Icon className="size-4" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {clientIds.length} prospects?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription asChild>
          <div className="space-y-3 w-full py-4">
            <p className="text-center text-sm text-muted-foreground">
              This action cannot be undone. You are about to permanently delete:
            </p>
            <ScrollArea className="bg-muted/50 p-3 rounded-lg text-foreground font-medium leading-relaxed h-22 w-full border">
              <div className="text-xs ">
                {companyNames.join(" - ")}
              </div>  
            </ScrollArea>
          </div>
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete All"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
