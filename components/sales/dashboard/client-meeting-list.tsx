// ============================================================================
// OLD DESIGN — commented out for rollback
// ============================================================================
// import { ScrollArea } from '@/components/ui/scroll-area';
// import React from 'react';
// import { usePaginatedQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Id } from "@/convex/_generated/dataModel";
// import { Calendar, Clock, Loader2 } from "lucide-react";
// import { formatDateFr, formatTime } from "@/lib/shared-utils/date";
// import { Button } from "@/components/ui/button";
// import { MeetingStatusBadge, MeetingTypeBadge, OutcomeBadge } from "./CrmBadges";
//
// interface ClientMeetingListProps {
//     clientId: Id<"clients">;
// }
//
// export default function ClientMeetingList({ clientId }: ClientMeetingListProps) {
//     const { results, status, loadMore } = usePaginatedQuery(
//         api.meetings.getClientMeetingsPaginated,
//         { clientId },
//         { initialNumItems: 5 }
//     );
//
//     return (
//         <div className="space-y-3">
//             <div className="flex items-center justify-between px-1">
//                 <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Historique des réunions</h3>
//                 {status === "LoadingFirstPage" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
//             </div>
//
//             <ScrollArea className="h-50 rounded-xl border border-border/40 bg-secondary/5 px-2.5 py-1.5">
//                 <div className="flex flex-col gap-2 py-2">
//                     {results.map((meeting) => (
//                         <div key={meeting._id} className="p-2 rounded-lg border bg-background/50">
//                             <div className="flex justify-between items-start mb-1.5">
//                                 <div className="flex items-center gap-2">
//                                     <div className="flex items-center gap-1 text-xs text-foreground font-black">
//                                         <Calendar className="w-3 h-3 text-primary/60" />
//                                         {formatDateFr(meeting.scheduledAt)}
//                                     </div>
//                                     <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
//                                         <Clock className="w-3 h-3 text-primary/40" />
//                                         {formatTime(meeting.scheduledAt)}
//                                     </div>
//                                 </div>
//                                 <MeetingStatusBadge status={meeting.status} />
//                             </div>
//
//                             <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-border/10 pb-1.5">
//                                 <div className="flex items-center gap-1 text-xs text-muted-foreground font-black tracking-tighter">
//                                     <MeetingTypeBadge type={meeting.type} />
//                                     {meeting.location && (
//                                         <>
//                                             <span> • </span>
//                                             <p>{meeting.location}</p>
//                                         </>
//                                     )}
//                                 </div>
//                                 {meeting.notes && (
//                                     <span className="text-xs text-muted-foreground font-medium italic truncate max-w-37.5">
//                                         {meeting.notes}
//                                     </span>
//                                 )}
//                             </div>
//                             {meeting.brief && meeting.status === "completed" && (
//                             <div className="border-t px-1 py-1.5 flex items-center justify-between gap-3">
//                                 <div className="">
//                               <span className="text-xs font-black tracking-tighter">Brief:</span>  {meeting.brief && (
//                                     <span className="text-xs text-muted-foreground font-medium italic truncate max-w-37.5">
//                                         {meeting.brief}
//                                     </span>
//                                 )}
//                                 </div>
//                                 {meeting.outcome && (
//                                     <OutcomeBadge outcome={meeting.outcome} />
//                                 )}
//                             </div>
//                             )}
//                         </div>
//                     ))}
//
//                     {status === "LoadingMore" && (
//                         <div className="flex justify-center p-2">
//                             <Loader2 className="w-4 h-4 animate-spin text-primary/30" />
//                         </div>
//                     )}
//
//                     {status === "CanLoadMore" && (
//                         <div className="pt-1 flex justify-center">
//                             <Button
//                                 variant="ghost"
//                                 size="sm"
//                                 className="text-xs font-black h-6 text-muted-foreground hover:bg-secondary/40 uppercase tracking-widest"
//                                 onClick={() => loadMore(5)}
//                             >
//                                 Charger plus
//                             </Button>
//                         </div>
//                     )}
//
//                     {results.length === 0 && status !== "LoadingFirstPage" && (
//                         <div className="flex flex-col items-center justify-center py-8 text-muted-foreground font-bold uppercase tracking-widest text-xs opacity-40">
//                             Aucune réunion précédente
//                         </div>
//                     )}
//                 </div>
//             </ScrollArea>
//         </div>
//     );
// }
// ============================================================================
// END OLD DESIGN
// ============================================================================

import { ScrollArea } from '@/components/ui/scroll-area';
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Calendar, Loader2, CalendarX2 } from "lucide-react";
import { formatDateNumeric as formatDateFr, formatTimeOnly as formatTime, formatRelativeTime } from "@/lib/utils/date-utils";
import { Button } from "@/components/ui/button";
import { MeetingStatusBadge, MeetingTypeBadge, OutcomeBadge } from "@/components/sales/dashboard/crm-badges";

interface ClientMeetingListProps {
    clientId: Id<"clients">;
}

export default function ClientMeetingList({ clientId }: ClientMeetingListProps) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.sales.meetings.queries.getClientMeetingsPaginated,
        { clientId },
        { initialNumItems: 5 }
    );

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Meeting History
                    {(results || []).length > 0 && (
                        <span className="ml-1.5 text-primary/60">({(results || []).length})</span>
                    )}
                </h3>
                {status === "LoadingFirstPage" && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </div>

            <ScrollArea className="h-50 rounded-lg border border-border/40 bg-secondary/5 px-2.5 py-1.5">
                <div className="flex flex-col gap-2 py-1">
                    {(results || []).map((meeting) => (
                        <div key={meeting._id} className="p-2.5 rounded-md border bg-secondary/50 hover:bg-secondary transition-colors">
                            {/* Top row: Date + Time + Relative + Status */}
                            <div className="flex justify-between items-center mb-1.5">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-sm text-foreground font-black">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                        {formatDateFr(meeting.scheduledAt)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold">
                                        {formatTime(meeting.scheduledAt)}
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground capitalize">
                                        {formatRelativeTime(meeting.scheduledAt)}
                                    </span>
                                </div>
                                <MeetingStatusBadge status={meeting.status} />
                            </div>

                            {/* Info row: Type badge + Location */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <MeetingTypeBadge type={meeting.type} />
                                {meeting.location && (
                                    <>
                                        <span className="text-muted-foreground/50">•</span>
                                        <span className="truncate max-w-45">
                                            {meeting.location}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Notes row (pre-meeting agenda) */}
                            {meeting.notes && (
                                <div className="mt-1.5 pt-1.5 border-t border-border/20">
                                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                                        <span className="font-black text-foreground/70 uppercase tracking-wider text-[10px] mr-1">Notes:</span>
                                        {meeting.notes}
                                    </p>
                                </div>
                            )}

                            {/* Brief + Outcome (only for completed) */}
                            {meeting.status === "completed" && (meeting.brief || meeting.outcome) && (
                                <div className="mt-1.5 pt-1.5 border-t border-border/20 flex items-start justify-between gap-2">
                                    {meeting.brief && (
                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                                            <span className="font-black text-foreground/70 uppercase tracking-wider text-[10px] mr-1">Brief:</span>
                                            {meeting.brief}
                                        </p>
                                    )}
                                    {meeting.outcome && (
                                        <div className="shrink-0">
                                            <OutcomeBadge outcome={meeting.outcome} />
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
                            <CalendarX2 className="w-6 h-6" />
                            <span className="text-xs font-black uppercase tracking-widest">
                                No previous meetings
                            </span>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
