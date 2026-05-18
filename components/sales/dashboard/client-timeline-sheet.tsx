"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  History,
  Phone,
  Mail,
  Video,
  Building2,
  MapPin,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { formatRelativeTime, formatDateTime } from "@/lib/utils/date-utils";
import { Id } from "@/convex/_generated/dataModel";
import { 
  OutcomeBadge, 
  MeetingStatusBadge, 
  InteractionStatusBadge 
} from "@/components/sales/dashboard/crm-badges";

interface ClientTimelineSheetProps {
  clientId: Id<"clients"> | null;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterType = "all" | "interaction" | "meeting";

export function ClientTimelineSheet({
  clientId,
  companyName,
  open,
  onOpenChange,
}: ClientTimelineSheetProps) {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [limit, setLimit] = useState(10);

  const timelineData = useQuery(
    api.sales.actionCenter.queries.getClientTimeline,
    clientId ? { clientId, limit, filterType } : "skip"
  );

  const handleLoadMore = () => {
    setLimit((prev) => prev + 10);
  };

  const getIcon = (type: "meeting" | "interaction", subType: string) => {
    if (type === "meeting") {
      switch (subType) {
        case "remote":
          return <Video className="w-4 h-4 text-indigo-500" />;
        case "in_office":
          return <Building2 className="w-4 h-4 text-violet-500" />;
        case "client_office":
          return <MapPin className="w-4 h-4 text-teal-500" />;
        default:
          return <Calendar className="w-4 h-4 text-primary" />;
      }
    } else {
      switch (subType) {
        case "call":
          return <Phone className="w-4 h-4 text-emerald-500" />;
        case "email":
          return <Mail className="w-4 h-4 text-sky-500" />;
        default:
          return <History className="w-4 h-4 text-muted-foreground" />;
      }
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl! p-0 flex flex-col  backdrop-blur-md border-l border-border/40">
        <SheetTitle className="sr-only">Client Activity Story</SheetTitle>

        {/* Header */}
        <SheetHeader className="p-4 pb-3 border-b bg-accent shrink-0">
          <div className="flex items-center gap-3 pr-8">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <History className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-foreground uppercase">
                Activity Timeline Story
              </h2>
              <SheetDescription className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                Client: <span className="text-foreground font-black">{companyName}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Filter Toolbar */}
        <div className="px-4 py-3 border-b bg-accent/20 flex flex-col sm:flex-row gap-2 shrink-0 sm:items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center sm:text-left">
            Filter activities:
          </span>
          <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
            <Button
              size="xs"
              variant={filterType === "all" ? "default" : "ghost"}
              onClick={() => {
                setFilterType("all");
                setLimit(10);
              }}
              className="w-full sm:w-auto justify-start sm:justify-center text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg"
            >
              <Layers className="w-3 h-3 mr-2 sm:mr-1" />
              All Story
            </Button>
            <Button
              size="xs"
              variant={filterType === "interaction" ? "default" : "ghost"}
              onClick={() => {
                setFilterType("interaction");
                setLimit(10);
              }}
              className="w-full sm:w-auto justify-start sm:justify-center text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg"
            >
              <Phone className="w-3 h-3 mr-2 sm:mr-1" />
              Calls & Emails
            </Button>
            <Button
              size="xs"
              variant={filterType === "meeting" ? "default" : "ghost"}
              onClick={() => {
                setFilterType("meeting");
                setLimit(10);
              }}
              className="w-full sm:w-auto justify-start sm:justify-center text-[10px] font-black uppercase tracking-wider h-7 px-2.5 rounded-lg"
            >
              <Calendar className="w-3 h-3 mr-2 sm:mr-1" />
              Meetings
            </Button>
          </div>
        </div>

        {/* Body content */}
        {!timelineData ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6 relative">
              {/* Timeline Vertical Spine */}
              {timelineData.items.length > 0 && (
                <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-border/40" />
              )}
 
              <div className="space-y-6">
                {timelineData.items.map((item) => {
                  const relativeTime = formatRelativeTime(item.timestamp);
                  const typeLabel =
                    item.type === "meeting"
                      ? `Meeting (${item.subType === "remote" ? "Video" : item.subType === "in_office" ? "In Office" : "Client Office"})`
                      : item.subType === "call"
                        ? "Phone Call"
                        : "Email";

                  return (
                    <div key={item.id} className="relative flex gap-4 items-start group">
                      {/* Timeline Icon Node */}
                      <div className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center shrink-0 z-10 shadow-xs group-hover:scale-110 transition-transform duration-200">
                        {getIcon(item.type, item.subType)}
                      </div>

                      {/* Card Content */}
                      <div className="flex-1 bg-accent/80 hover:bg-accent border border-border/40 hover:border-border/80 p-4 rounded-2xl transition-all duration-300 space-y-2">
                        <div className="flex flex-col gap-1 w-full">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="text-xs font-bold text-foreground truncate">
                              {typeLabel}
                            </span>
                            {item.status !== "completed" && (
                              <span className="text-[10px] font-semibold text-foreground/70 uppercase tracking-widest shrink-0">
                                {relativeTime}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {item.type === "meeting" ? (
                              <MeetingStatusBadge status={item.status} />
                            ) : (
                              <InteractionStatusBadge status={item.status} />
                            )}
                            {item.outcome && (
                              <OutcomeBadge outcome={item.outcome} />
                            )}
                          </div>
                        </div>

                        {item.notes ? (
                          <p className="text-xs font-semibold text-foreground/90 leading-relaxed italic bg-background/50 p-2.5 rounded-xl border border-border/20">
                            &ldquo;{item.notes}&rdquo;
                          </p>
                        ) : (
                          <p className="text-xs font-semibold text-foreground/50 leading-relaxed italic">
                            No notes recorded.
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2.5 border-t border-border/20 text-[9px] font-black text-foreground/80 uppercase tracking-wider">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground/50 text-[8px] tracking-widest font-black">Created</span>
                            <span className="text-md text-bold text-foreground/60 normal-case">
                              {formatDateTime(item.createdAt)}
                            </span>
                            <span className="text-md text-bold text-foreground/60 normal-case">
                              by {item.creatorName}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-foreground/50 text-[8px] tracking-widest font-black">Scheduled</span>
                            <span className=" font-bold">
                              {formatDateTime(item.timestamp)}
                            </span>
                          </div>

                          {item.finishedAt ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground/50 text-[8px] tracking-widest font-black">Finished</span>
                              <span className={`font-bold ${item.status === 'completed' ? 'text-emerald-500' : 'text-destructive'}`}>
                                {formatDateTime(item.finishedAt)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-0.5 opacity-60">
                              <span className="text-foreground/50 text-[8px] tracking-widest font-black">Finished</span>
                              <span className="text-foreground/60 italic font-bold">
                                Pending...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {timelineData.items.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40 space-y-3">
                    <History className="w-10 h-10 text-muted-foreground/20" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      No Activities Found
                    </p>
                    <p className="text-[10px] text-center max-w-xs leading-normal">
                      There are no meetings or interactions recorded for this client matching this filter.
                    </p>
                  </div>
                )}

                {/* Pagination Controls */}
                {timelineData.hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      className="text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white"
                    >
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin group-hover:block hidden" />
                      Load More Stories
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
