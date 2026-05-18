"use client" 
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar,  Loader2, PhoneOff } from "lucide-react";
import { formatDateNumeric as formatDateFr, formatTimeOnly as formatTime, formatRelativeTime } from "@/lib/utils/date-utils";
import { Button } from "@/components/ui/button";
import { InteractionStatusBadge, InteractionTypeBadge, OutcomeBadge } from "@/components/sales/dashboard/crm-badges";

interface ClientInteractionListProps {
    clientId: Id<"clients">;
}

export default function ClientInteractionList({ clientId }: ClientInteractionListProps) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.sales.interactions.queries.getInteractionsPaginated,
        { clientId },
        { initialNumItems: 5 }
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Interaction History
                    {(results || []).length > 0 && (
                        <span className="ml-1.5 text-primary/60">({(results || []).length})</span>
                    )}
                </h3>
                {status === "LoadingFirstPage" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </div>

            <ScrollArea className="h-50 rounded-lg border border-border/40 bg-secondary/5 px-2.5 py-1.5">
                <div className="flex flex-col gap-2 py-1">
                    {(results || []).map((interaction) => (
                        <div key={interaction._id} className="p-2.5 rounded-md border bg-secondary/50 hover:bg-secondary transition-colors">
                            {/* Top row: Date + Time + Relative + Status */}
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-sm text-foreground font-black">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        {formatDateFr(interaction.scheduledAt)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                                        {formatTime(interaction.scheduledAt)}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground capitalize">
                                        {formatRelativeTime(interaction.scheduledAt)}
                                    </span>
                                </div>
                                <InteractionStatusBadge status={interaction.status} />
                            </div>

                            {/* Info row: Type badge */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <InteractionTypeBadge type={interaction.type} />
                            </div>

                            {/* Notes row (pre-interaction agenda) */}
                            {interaction.notes && (
                                <div className="mt-1.5 pt-1.5 border-t border-border/20">
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                        <span className="font-black text-foreground/70 uppercase tracking-wider text-[10px] mr-1">Notes:</span>
                                        {interaction.notes}
                                    </p>
                                </div>
                            )}

                            {/* Brief + Outcome (only for completed) */}
                            {interaction.status === "completed" && (interaction.brief || interaction.outcome) && (
                                <div className="mt-1.5 pt-1.5 border-t border-border/20 flex items-start justify-between gap-2">
                                    {interaction.brief && (
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                                            <span className="font-black text-foreground/70 uppercase tracking-wider text-[10px] mr-1">Brief:</span>
                                            {interaction.brief}
                                        </p>
                                    )}
                                    {interaction.outcome && (
                                        <div className="shrink-0">
                                            <OutcomeBadge outcome={interaction.outcome} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {status === "LoadingMore" && (
                        <div className="flex justify-center p-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/30" />
                        </div>
                    )}

                    {status === "CanLoadMore" && (
                        <div className="flex justify-center pt-1 pb-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-black h-7 text-foreground hover:bg-secondary/40 uppercase tracking-widest"
                                onClick={() => loadMore(5)}
                            >
                                Load more
                            </Button>
                        </div>
                    )}

                    {(results || []).length === 0 && status !== "LoadingFirstPage" && (
                        <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                            <PhoneOff className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                No previous interactions
                            </span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
