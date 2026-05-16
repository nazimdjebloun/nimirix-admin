"use client";

import * as React from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { UserSelect } from "@/components/shared/user-select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BatchAssignProspectDialogProps {
  clientIds: Id<"clients">[];
  companyNames: string[];
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BatchAssignProspectDialog({ 
  clientIds, 
  companyNames, 
  onSuccess,
  trigger 
}: BatchAssignProspectDialogProps) {
  const batchAssign = useMutation(api.sales.pipeline.mutations.batchAssignSalesPerson)
  const [isAssigning, setIsAssigning] = React.useState(false)
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  async function handleAssign() {
    if (selectedAgentId === null) {
      toast.error("Please select an agent")
      return
    }

    try {
      setIsAssigning(true)
      await batchAssign({ 
        clientIds, 
        salesPersonId: selectedAgentId 
      })
      toast.success(`${clientIds.length} prospects assigned`)
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign"
      toast.error(errorMessage)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <UserPlus className="h-4 w-4" />
            Assign ({clientIds.length})
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent size="default">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign {clientIds.length} prospects?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 w-full" >
              <div className="space-y-2">
                <p>Select the agent who will handle these prospects:</p>
                <div className="w-full">
                  <UserSelect 
                    value={selectedAgentId ?? ""} 
                    onValueChange={setSelectedAgentId}
                    roles={["sales", "leadSales", "admin"]}
                    placeholder="Select agent..."
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prospects to assign:</p>
              <ScrollArea className="bg-muted/50 p-3 rounded-lg text-foreground font-medium leading-relaxed h-32 w-full border">
                <div className="text-xs">
                  {companyNames.join(", ")}
                </div>
              </ScrollArea>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isAssigning}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAssign}
            disabled={isAssigning}
          >
            {isAssigning ? "Assigning..." : "Confirm Assignment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
