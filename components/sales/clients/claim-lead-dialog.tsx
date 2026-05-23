"use client";

import { Button } from "@/components/ui/button";
import { BadgeCheck } from "lucide-react";
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
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface ClaimLeadDialogProps {
  companyName: string;
  clientId: Id<"clients">;
}

export default function ClaimLeadDialog({ companyName, clientId }: ClaimLeadDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const batchClaim = useMutation(api.sales.clients.mutations.batchClaimClients);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      await batchClaim({ clientIds: [clientId] });
      toast.success("Client claimed successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to claim client");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="rounded-lg font-black uppercase text-[9px] tracking-widest gap-1.5 bg-primary/80 hover:bg-primary transition-all"
        >
          <BadgeCheck className="h-3 w-3" />
          Claim
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black tracking-tight">
            Claim Client
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action will assign you as the salesperson for{" "}
            <span className="font-extrabold">{companyName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 p-1">
          <AlertDialogCancel className="rounded-xl font-black uppercase text-[10px] tracking-widest">
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 shadow-none border-primary"
          >
            {isPending ? "Claiming..." : "Claim"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
