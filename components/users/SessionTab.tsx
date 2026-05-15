import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Laptop, Smartphone, Monitor, ShieldAlert } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DeviceIcon({ userAgent }: { userAgent: string }) {
    if (/mobile/i.test(userAgent)) return <Smartphone className="h-4 w-4 text-primary" />;
    if (/tablet|ipad/i.test(userAgent)) return <Monitor className="h-4 w-4 text-primary" />;
    return <Laptop className="h-4 w-4 text-primary" />;
}

function parseDeviceName(userAgent: string): string {
    const match = userAgent.match(/\(([^)]+)\)/);
    return match?.[1]?.split(";")[0]?.trim() ?? "Unknown Device";
}

// ─── Sessions Tab ─────────────────────────────────────────────────────────────

type Session = Awaited<ReturnType<typeof authClient.listSessions>>["data"][number];

export default function SessionsTab({ currentSessionToken }: { currentSessionToken: string }) {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [revokingToken, setRevokingToken] = useState<string | null>(null);

    const fetchSessions = async () => {
        const { data, error: err } = await authClient.listSessions();
        if (err) { setError(true); return; }
        setSessions([...(data ?? [])].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        (async () => {
            const { data, error: err } = await authClient.listSessions();
            if (err) { setError(true); setIsLoading(false); return; }
            setSessions(
                [...(data ?? [])].sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
            );
            setIsLoading(false);
        })();
    }, []);
    const onRevoke = async (token: string) => {
        setRevokingToken(token);
        try {
            const { error: err } = await authClient.revokeSession({ token });
            if (err) throw new Error(err.message);
            toast.success("Session revoked successfully");
            await fetchSessions();
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setRevokingToken(null);
        }
    };

    if (error) return (
        <div className="py-6 text-center text-sm text-destructive font-medium bg-destructive/5 rounded-xl border border-destructive/10">
            Failed to load sessions.
        </div>
    );

    return (
        <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground font-medium px-1">
                Devices currently logged in
            </p>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Spinner className="h-8 w-8 text-primary/40" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl">
                    <p className="text-sm text-muted-foreground font-medium">No active sessions found.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {sessions.map((s) => {
                        const isCurrent = s.token === currentSessionToken;
                        const ua = s.userAgent ?? "";
                        const isRevoking = revokingToken === s.token;

                        return (
                            <li
                                key={s.id}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                                    isCurrent ? "bg-primary/5 border-primary/20 ring-1 ring-primary/10" : "bg-card hover:border-muted-foreground/30"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-muted/50 border shadow-sm">
                                        <DeviceIcon userAgent={ua} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold flex items-center gap-2">
                                            {parseDeviceName(ua)}
                                            {isCurrent && (
                                                <span className="text-[9px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border uppercase tracking-wider">
                                                    Current Session
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-medium">
                                            Last active on {new Date(s.updatedAt).toLocaleDateString("en-US", {
                                                day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {!isCurrent && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRevoke(s.token)}
                                        disabled={!!revokingToken}
                                        className="h-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 font-bold transition-colors"
                                    >
                                        {isRevoking ? <Spinner /> : (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldAlert className="h-4 w-4" />
                                                Revoke
                                            </div>
                                        )}
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}