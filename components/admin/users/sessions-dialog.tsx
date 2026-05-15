
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Globe, Monitor, ShieldAlert, Calendar, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DeviceIcon, formatIP, parseUserAgent } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription, 
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";



interface SessionsDialogProps {
  user: Doc<"user"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
type Session = Doc<"session">;

export function SessionsDialog({ user, open, onOpenChange }: SessionsDialogProps) {
  const [revokingId, setRevokingId] = useState<string | null>(null);
  // const [sessions, setSessions] = useState<Session[]>([]);
  // const [loading, setLoading] = useState(false);   

  const { data: currentSession } = authClient.useSession();
  const currentToken = currentSession?.session.token;

  const userSessions = useQuery(api.users.getUserSessions, user ? { userId: user._id } : "skip");
  const revokeSessionMutation = useMutation(api.users.revokeSession);

  const loading = userSessions === undefined && user !== null;
  const sessions = (userSessions || []).sort(
    (a:Session, b:Session) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );


// fetching session usign admin plugin
  // useEffect(() => {
  //   if (!user || !open) return;
  //   const fetchSessions = async () => {
  //     setLoading(true);
  //     try {
  //       const { data, error } = await authClient.admin.listUserSessions({ userId: user._id });
  //       if (error) throw new Error(error.message);
  //       const list = (data?.sessions ?? []) as Session[];
  //       setSessions(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  //     } catch (err) {
  //       toast.error(err instanceof Error ? err.message : "Failed to load sessions");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchSessions();
  // }, [user, open]);


  const handleRevoke = async (sessionId: string, token: string) => {
    if (!user) return;
    if (token === currentToken) {
      toast.error("You cannot revoke your own session here.");
      return;
    }
    setRevokingId(sessionId);
    try {
      await revokeSessionMutation({ sessionId });
      toast.success("Session revoked");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

// using admin plugin
//   const handleRevoke = async (token: string) => {
//     if (!user) return;
//     if (token === currentToken) {
//       toast.error("You cannot revoke your own session here.");
//       return;
//     }
//     setRevokingToken(token);
//     try {
//       const { error } = await authClient.admin.revokeUserSession({ sessionToken: token });
//       if (error) throw new Error(error.message);
//       toast.success("Session revoked");
//       setSessions((prev) => prev.filter((s) => s.token !== token));
//     } catch (err) {
//       toast.error(err instanceof Error ? err.message : "Failed to revoke session");
//     } finally {
//       setRevokingToken(null);
//     }
//   };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-xl rounded-2xl overflow-hidden p-0">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0 ring-1 ring-primary/20">
              <Globe className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold font-heading">
                Active Sessions — <span className="text-primary">{user?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Manage connected devices and account security.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[50vh] sm:h-96 px-4 sm:px-6 py-4">
          {loading ? (
            <div className="flex h-64 w-full items-center justify-center">
              <Spinner className="h-8 w-8 text-primary/60" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex h-64 w-full flex-col items-center justify-center gap-3 text-muted-foreground/60">
              <div className="rounded-2xl bg-muted/30 p-4 ring-1 ring-border/50">
                <Monitor className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-sm font-medium italic">No active sessions found.</p>
            </div>
          ) : (
            <div className="grid gap-3 pb-4">
              {sessions.map((session: Session) => {
                const isCurrent = session.token === currentToken;
                const isRevoking = revokingId === session._id;

                return (
                  <div
                    key={session._id}
                    className={`group relative flex flex-col gap-3 rounded-2xl border p-2 transition-all hover:bg-muted/10 ${
                      isCurrent
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-border/60 hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          isCurrent ? "bg-background border-primary/20" : "bg-muted/30 border-border/50"
                        }`}>
                          <DeviceIcon userAgent={session.userAgent || ""} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1 py-0.5">
                          <div className="flex flex-col gap-1">
                            <h4
                              className="hidden md:block text-sm font-bold truncate leading-tight text-foreground"
                              title={parseUserAgent(session.userAgent || "")}
                            >
                              {parseUserAgent(session.userAgent || "")}
                            </h4>
                            {isCurrent && (
                              <div className="flex">
                                <Badge className="bg-primary/20 text-primary border-none text-[9px] h-4 px-1.5 font-black uppercase tracking-widest ring-1 ring-primary/30">
                                  Current
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {!isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevoke(session._id, session.token)}
                          disabled={isRevoking}
                          className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 gap-1.5 px-2 rounded-lg"
                        >
                          {isRevoking ? (
                            <Spinner className="h-4 w-4" />
                          ) : (
                            <>
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none">Revoke</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="block md:hidden">
                      <h4
                        className="text-sm font-bold truncate leading-tight text-foreground"
                        title={parseUserAgent(session.userAgent || "")}
                      >
                        {parseUserAgent(session.userAgent || "")}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 mt-1 border-muted-foreground/10">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <MapPin className="h-3 w-3 opacity-60 text-primary" />
                        <span className="font-bold text-foreground/80 tracking-tight">
                          {formatIP(session.ipAddress)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3 opacity-60" />
                        <span className="font-bold uppercase tracking-wider text-foreground/60">
                          {new Date(session.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="bg-muted/30 px-4 py-3 flex justify-end gap-3 border-t">
          <Button variant="outline" className="rounded-xl px-8" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}