"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User as UserIcon, ShieldUser, Briefcase } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { ROLES, Role, ROLE_LABELS } from "@/lib/auth/roles";
import { authClient } from "@/lib/auth-client";



function getRoleIcon(role: Role) {
  if (role === "admin") return <ShieldUser className="h-6 w-6 text-orange-500" />;
  if (role.startsWith("lead")) return <Briefcase className="h-6 w-6 text-violet-500" />;
  return <UserIcon className="h-6 w-6 text-blue-500" />;
}

interface UpdateUserRoleDialogProps {
  user: Doc<"user"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateUserRoleDialog({ user, open, onOpenChange }: UpdateUserRoleDialogProps) {
  const [role, setRole] = useState<Role>((user?.role as Role) ?? "user");
  const [isPending, setIsPending] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsPending(true);
    try {
      const { error } = await authClient.admin.setRole({
        userId: user._id,
        role,
      });
      if (error) throw new Error(error.message || "Failed to update role");
      toast.success(`Role updated to ${ROLE_LABELS[role]}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:max-w-md rounded-2xl overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-muted/50">
            {getRoleIcon(role)}
          </AlertDialogMedia>
          <AlertDialogTitle className="text-xl font-bold font-heading">Update Role</AlertDialogTitle>
          <AlertDialogDescription>
            Select a new role for{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl" position="popper" align="start">
              <SelectGroup>
                <SelectLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 py-2">
                  Roles
                </SelectLabel>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r} className="rounded-lg">
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            disabled={role === user?.role || isPending}
          >
            {isPending ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}