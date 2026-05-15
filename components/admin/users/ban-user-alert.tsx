// components/admin/users/ban-user-alert.tsx
"use client";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { Ban, PersonStanding } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogMedia,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface BanUserAlertProps {
  user: Doc<"user"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BanUserAlert({ user, open, onOpenChange }: BanUserAlertProps) {
  const isBanned = user?.banned;
  const banUser = useMutation(api.users.banUser);

const [isPending, setIsPending] = useState(false);

const handleToggleBan = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (!user) return;
  setIsPending(true);
  try {
    await banUser({ userId: user._id, banned: !isBanned });
    toast.success(isBanned ? "User unbanned successfully" : "User banned successfully");
    onOpenChange(false);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : "Action failed");
  } finally {
    setIsPending(false);
  }
};

//client fucntion using admin.banuser
// const handleToggleBan = async (e: React.MouseEvent) => {
//   console.log("user", user);
//   console.log("userId", user?._id);
//   if (!user?._id) {
//     console.log("early return — _id is null or undefined");
//     return;
//   }
//   setIsPending(true);
//   try {
//     if (isBanned) {
//       const { error, data } = await authClient.admin.unbanUser({ userId: user._id });
//       console.log("unban result", { error, data });
//       if (error) throw new Error(error.message);
//     } else {
//       const { error, data } = await authClient.admin.banUser({ userId: user._id });
//       console.log("ban result", { error, data });
//       if (error) throw new Error(error.message);
//     }
//     toast.success(isBanned ? "User unbanned successfully" : "User banned successfully");
//     onOpenChange(false);
//   } catch (err) {
//     console.log("caught error", err);
//     toast.error(err instanceof Error ? err.message : "Action failed");
//   } finally {
//     setIsPending(false);
//   }
// };





  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            {isBanned 
              ? <PersonStanding className="text-green-600" /> 
              : <Ban className="text-destructive" />
            }
          </AlertDialogMedia>
          <AlertDialogTitle>
            {isBanned ? "Unban User" : "Ban User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBanned ? (
              <>Restore access for <strong>{user?.name}</strong>? They will be able to sign in again.</>
            ) : (
              <>Ban <strong>{user?.name}</strong>? This will prevent them from signing in and revoke all active sessions.</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
<Button
  onClick={handleToggleBan}
  variant={isBanned ? "default" : "destructive"}
  disabled={isPending}
>
  {isPending ? <Spinner className="h-4 w-4" /> : "Confirm"}
</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

