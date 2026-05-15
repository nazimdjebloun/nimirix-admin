"use client";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, UserX, Trash2, History } from "lucide-react";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { BanUserAlert } from "./ban-user-alert";
import { DeleteUserAlert } from "./delete-user-alert";
import { SessionsDialog } from "./sessions-dialog";
import { UpdateUserRoleDialog } from "./update-user-role-dialog";
import { authClient } from "@/lib/auth-client";

interface UserActionsProps {
  user: Doc<"user">;
}

type Dialog = "ban" | "delete" | "sessions" | "role" | null;

export function UserActions({ user }: UserActionsProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const { data: currentSession } = authClient.useSession();
const isMe = currentSession?.user.email === user.email;
  if (isMe) {
    return (
      <Badge className="bg-primary/20 text-primary border-none  font-black uppercase tracking-widest ring-1 ring-primary/30">
        Me
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-50 shadow-sm border-muted">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => setDialog("role")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Change Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => setDialog("sessions")}>
            <History className="mr-2 h-4 w-4" />
            <span>View Sessions</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950/20"
            onClick={() => setDialog("ban")}
          >
            <UserX className="mr-2 h-4 w-4" />
            <span>{user.banned ? "Unban User" : "Ban User"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5 dark:focus:bg-destructive/10"
            onClick={() => setDialog("delete")}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BanUserAlert
        user={user}
        open={dialog === "ban"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <DeleteUserAlert
        user={user}
        open={dialog === "delete"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <SessionsDialog
        user={user}
        open={dialog === "sessions"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      <UpdateUserRoleDialog
        user={user}
        open={dialog === "role"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
    </>
  );
}