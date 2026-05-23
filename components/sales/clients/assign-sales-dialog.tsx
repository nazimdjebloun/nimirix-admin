"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { UserSelect } from "@/components/shared/user-select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface AssignSalesDialogProps {
  companyName: string;
  clientId: Id<"clients">;
  initialUserId?: string;
  trigger?: React.ReactNode;
}

export default function AssignSalesDialog({
  companyName,
  clientId,
  initialUserId = "",
  trigger,
}: AssignSalesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId);
  const batchAssign = useMutation(api.sales.clients.mutations.batchAssignClients);

  const isDirty = selectedUserId !== initialUserId;

  const handleConfirm = async () => {
    if (!isDirty) {
      setIsOpen(false);
      return;
    }

    setIsPending(true);
    try {
      await batchAssign({ clientIds: [clientId], salesPersonId: selectedUserId });
      toast.success(selectedUserId === "" ? "Client unassigned" : "Client assigned successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update assignment");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setSelectedUserId(initialUserId);
      }}
    >
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="default"
            size="sm"
            className="rounded-lg font-black uppercase text-[9px] tracking-widest gap-1.5 bg-primary/80 hover:bg-primary transition-all"
          >
            <UserPlus className="h-3 w-3" />
            Assign
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black tracking-tight">
            Assign Client
          </AlertDialogTitle>
          <AlertDialogDescription>
            Assign <span className="font-extrabold">{companyName}</span> to a sales rep
          </AlertDialogDescription>
        </AlertDialogHeader>

        <UserSelect
          value={selectedUserId}
          onValueChange={setSelectedUserId}
          roles={["sales", "leadSales", "admin"]}
          placeholder="Select a sales rep..."
          disabled={isPending}
        />

        <AlertDialogFooter className="gap-2 p-1">
          <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={!isDirty || isPending}
            className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-none border-primary"
          >
            {isPending ? "Assigning..." : "Confirm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
