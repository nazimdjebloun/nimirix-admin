"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SortFilter } from "@/components/sales/dashboard/sort-filter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Search,
  Loader2,
  Edit2,
  Settings,
  CalendarX2,
} from "lucide-react";
import {
  formatDateNumeric as formatDateShort,
  formatTimeOnly as formatTime,
  formatRelativeTime,
} from "@/lib/utils/date-utils";

import { UpdateMeetingStatusDialog } from "@/components/sales/dashboard/update-meeting-status-dialog";
import { EditMeetingDialog } from "@/components/sales/dashboard/edit-meeting-dialog";
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { MeetingStatusBadge, MeetingTypeBadge } from "@/components/sales/dashboard/crm-badges";

export function MeetingsScheduleCard() {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [search, setSearch] = useState("");
  const [statusMeeting, setStatusMeeting] = useState<(Doc<"clientMeetings"> & { client?: { companyName: string } | null }) | null>(null);
  const [editDetailsMeeting, setEditDetailsMeeting] = useState<(Doc<"clientMeetings"> & { client?: { companyName: string } | null }) | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const openClientDetail = (id: Id<"clients">) => {
    setSelectedClientId(id);
    setDetailOpen(true);
  };

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.meetings.queries.getMeetingsPaginated,
    { sortOrder, status: "scheduled" },
    { initialNumItems: 10 }
  );

  const filteredMeetings = (results || []).filter((meeting) =>
    (meeting.client?.companyName || "").toLowerCase().includes(search.toLowerCase()) ||
    (meeting.client?.contact || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Card className="flex min-w-0 flex-col justify-between p-1 lg:h-100">
        <CardHeader className="space-y-2 pb-2">
          <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
              Scheduled Meetings
            </CardTitle>
            <div className="flex items-center gap-2">
              <SortFilter value={sortOrder} onValueChange={(value) => setSortOrder(value as "newest" | "oldest")} />
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              className="h-8 border-border/40 bg-secondary/20 pl-8 text-xs font-medium focus-visible:ring-primary/20"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </CardHeader>

        <ScrollArea className="rounded-lg border border-border/40 bg-secondary/5 px-3 py-1.5 max-lg:h-[28rem] lg:h-72">
          <div className="space-y-2 py-1">
            {filteredMeetings.map((meeting) => (
              <div
                key={meeting._id}
                className="min-w-0 space-y-2 rounded-md border bg-secondary/50 p-2.5 transition-colors hover:bg-secondary"
              >
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 sm:flex-1">
                    <button
                      onClick={() => openClientDetail(meeting.clientId)}
                      className="block min-w-0 cursor-pointer break-words text-left text-sm font-black uppercase tracking-tight text-foreground transition-colors hover:text-primary"
                    >
                      {meeting.client?.companyName}
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                    <MeetingStatusBadge status={meeting.status} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setStatusMeeting(meeting)}
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditDetailsMeeting(meeting)}
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-0.5 flex w-full flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDateShort(meeting.scheduledAt)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatTime(meeting.scheduledAt)}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground capitalize">
                    {formatRelativeTime(meeting.scheduledAt)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <MeetingTypeBadge type={meeting.type} />
                  {meeting.location && (
                    <>
                      <span className="hidden text-border sm:inline">&bull;</span>
                      <span className="max-w-full break-words sm:max-w-45 sm:truncate">{meeting.location}</span>
                    </>
                  )}
                </div>

                {meeting.notes && (
                  <div className="mt-1.5 border-t pt-1.5">
                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="mr-1 text-[10px] font-black uppercase tracking-wider text-foreground/70">Notes:</span>
                      {meeting.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {statusMeeting && (
              <UpdateMeetingStatusDialog
                meeting={statusMeeting}
                open={!!statusMeeting}
                onOpenChange={(open) => !open && setStatusMeeting(null)}
              />
            )}

            {editDetailsMeeting && (
              <EditMeetingDialog
                meeting={editDetailsMeeting}
                open={!!editDetailsMeeting}
                onOpenChange={(open) => !open && setEditDetailsMeeting(null)}
              />
            )}

            {status === "LoadingMore" && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary/30" />
              </div>
            )}

            {status === "CanLoadMore" && (
              <div className="flex justify-center p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-black tracking-widest text-foreground uppercase hover:bg-secondary/40"
                  onClick={() => loadMore(5)}
                >
                  Load more
                </Button>
              </div>
            )}

            {filteredMeetings.length === 0 && status !== "LoadingFirstPage" && (
              <div className="flex flex-col items-center justify-center space-y-2 py-12 text-muted-foreground">
                <CalendarX2 className="h-6 w-6" />
                <p className="text-xs font-bold tracking-widest uppercase">No meetings found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
      <ClientDetailSheet clientId={selectedClientId} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
