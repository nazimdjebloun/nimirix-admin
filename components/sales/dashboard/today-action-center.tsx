"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet";
import {
  Bell,
  Video,
  Snowflake,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  Inbox,
  Settings,
  ClipboardCheck
} from "lucide-react";
import { formatTimeOnly as formatTime, formatRelativeTime } from "@/lib/utils/date-utils";
import { Id } from "@/convex/_generated/dataModel";
import { UpdateMeetingStatusDialog } from "@/components/sales/dashboard/update-meeting-status-dialog";
import { UpdateInteractionStatusDialog } from "@/components/sales/dashboard/update-interaction-status-dialog";

interface Reminder {
  _id: Id<"crmReminders">;
  userId: string;
  clientId?: Id<"clients">;
  entityType: "client" | "contact" | "meeting" | "interaction";
  entityId?: string;
  remindAt: number;
  notes?: string;
  isSent: boolean;
  isSeen: boolean;
  createdAt: number;
}

interface Meeting {
  _id: Id<"clientMeetings">;
  clientId: Id<"clients">;
  userId: string;
  scheduledAt: number;
  type: "in_office" | "remote" | "client_office";
  location?: string;
  status: "scheduled" | "completed" | "missed" | "cancelled";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface Interaction {
  _id: Id<"clientInteractions">;
  clientId: Id<"clients">;
  userId: string;
  type: "call" | "email";
  scheduledAt: number;
  status: "scheduled" | "completed" | "missed" | "no_response";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface ColdProspect {
  _id: Id<"clients">;
  companyName: string;
  status: string;
  createdAt: number;
  lastInteractionAt?: number;
}

interface StaleVerbal {
  _id: Id<"clients">;
  companyName: string;
  status: string;
  updatedAt: number;
}

interface TodayActionCenterProps {
  today: (Reminder | Meeting | Interaction)[];
  upcoming: Reminder[];
  hygiene: {
    cold: ColdProspect[];
    staleVerbal: StaleVerbal[];
    neverContacted: ColdProspect[];
    hotList: ColdProspect[];
  };
  currentTime: number;
}

function isReminder(item: Reminder | Meeting | Interaction): item is Reminder {
  return "remindAt" in item;
}

function isMeeting(item: Reminder | Meeting | Interaction): item is Meeting {
  return !isReminder(item) && "type" in item && (item.type === "remote" || item.type === "in_office" || item.type === "client_office");
}

function isInteraction(item: Reminder | Meeting | Interaction): item is Interaction {
  return !isReminder(item) && "type" in item && (item.type === "call" || item.type === "email");
}

export function TodayActionCenter({ today, upcoming, hygiene, currentTime }: TodayActionCenterProps) {
  const [selectedClientId, setSelectedClientId] = useState<Id<"clients"> | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusMeeting, setStatusMeeting] = useState<Meeting | null>(null);
  const [interactionToUpdate, setInteractionToUpdate] = useState<Interaction | null>(null);
  const markSeen = useMutation(api.sales.actionCenter.mutations.markReminderSeen);

  const openDetail = (clientId: Id<"clients">) => {
    setSelectedClientId(clientId);
    setDetailOpen(true);
  };

  const reminders = today.filter(isReminder);
  const meetings = today.filter(isMeeting);
  const interactions = today.filter(isInteraction);

  const totalAlerts =
    reminders.length +
    meetings.length +
    interactions.length +
    hygiene.cold.length +
    hygiene.staleVerbal.length +
    hygiene.neverContacted.length +
    hygiene.hotList.length;

  return (
    <div>
      <Card className="bg-background/40  shadow-xs overflow-hidden flex flex-col h-full rounded-2xl border border-border/40">
        <CardHeader className="p-4 pb-2 shrink-0">
          <div className="flex justify-between items-center px-1">
            <CardTitle className="text-xs font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Action Center
          </CardTitle>
          {totalAlerts > 0 && (
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
              {totalAlerts} action{totalAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>

        <ScrollArea className="flex-1 min-h-75 max-h-112.5">
          <CardContent className="p-4 pt-1 space-y-4">
          {/* Hot List (High Priority) */}
          {hygiene.hotList && hygiene.hotList.length > 0 && (
            <Section
              icon={<Zap className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />}
              title="Hot Leads 🔥"
              count={hygiene.hotList.length}
              color="orange"
            >
              {hygiene.hotList.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-2 rounded-md bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors cursor-pointer group"
                  onClick={() => openDetail(client._id)}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-black text-orange-700 dark:text-orange-400 truncate flex items-center gap-1.5">
                      {client.companyName}
                    </span>
                    <span className="text-[10px] text-orange-600/80 dark:text-orange-400/80 font-bold uppercase tracking-wider">
                      {client.status.replace("_", " ")}
                    </span>
                  </div>
                  <Badge
                    className="bg-orange-500 text-white hover:bg-orange-600 border-0 text-[10px] font-black h-5 px-1.5 shadow-sm shadow-orange-500/20"
                  >
                    GO
                  </Badge>
                </div>
              ))}
            </Section>
          )}
          {statusMeeting && (
            <UpdateMeetingStatusDialog
              meeting={statusMeeting}
              open={!!statusMeeting}
              onOpenChange={(open) => !open && setStatusMeeting(null)}
            />
          )}
          {/* Today's Meetings */}
          {meetings.length > 0 && (
            <Section
              icon={<Video className="w-3.5 h-3.5 text-violet-500" />}
              title="Meetings Today"
              count={meetings.length}
              color="violet"
            >
              {meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="flex items-center justify-between p-2 rounded-md bg-violet-500/5 border border-violet-500/10 hover:bg-violet-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Button variant="ghost" size="icon"
                      onClick={() => setStatusMeeting(meeting)}
                      className="h-7 w-7 text-muted-foreground hover:text-primary">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex items-center gap-1 text-xs text-violet-600 font-bold shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTime(meeting.scheduledAt)}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {meeting.type === "remote"
                        ? "Video"
                        : meeting.type === "in_office"
                          ? "Office"
                          : "Client Office"}
                      {meeting.location && ` — ${meeting.location}`}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] cursor-pointer hover:bg-violet-500/20 transition-colors shrink-0"
                    onClick={() => openDetail(meeting.clientId)}
                  >
                    View Client
                  </Badge>
                </div>
              ))}
            </Section>
          )}

          {/* Today's Interactions (Calls/Emails) */}
          {interactions.length > 0 && (
            <Section
              icon={<Zap className="w-3.5 h-3.5 text-blue-500" />}
              title="Calls & Emails"
              count={interactions.length}
              color="blue"
            >
              {interactions.map((interaction) => (
                <div
                  key={interaction._id}
                  className="flex items-center justify-between p-2 rounded-md bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setInteractionToUpdate(interaction)}
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                    >
                      <ClipboardCheck className="w-3.5 h-3.5" />
                    </Button>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-bold shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTime(interaction.scheduledAt)}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">
                      {interaction.type === "call" ? "Call" : "Email"}
                      {interaction.notes && ` — ${interaction.notes}`}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] cursor-pointer hover:bg-blue-500/20 transition-colors shrink-0"
                    onClick={() => openDetail(interaction.clientId)}
                  >
                    View Client
                  </Badge>
                </div>
              ))}
            </Section>
          )}

          {interactionToUpdate && (
            <UpdateInteractionStatusDialog
              interaction={interactionToUpdate}
              open={!!interactionToUpdate}
              onOpenChange={(open) => !open && setInteractionToUpdate(null)}
            />
          )}

          {/* Today's Reminders */}
          {reminders.length > 0 && (
            <Section
              icon={<Bell className="w-3.5 h-3.5 text-amber-500" />}
              title="Today's Reminders"
              count={reminders.length}
              color="amber"
            >
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className="flex items-center justify-between p-2 rounded-md bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                        {reminder.entityType === "meeting"
                          ? "Meeting"
                          : reminder.entityType === "interaction"
                            ? "Interaction"
                            : reminder.entityType === "contact"
                              ? "Contact"
                              : "Client"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        {formatTime(reminder.remindAt)}
                      </span>
                    </div>
                    {reminder.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        {reminder.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-amber-500 hover:text-emerald-500 hover:bg-emerald-500/10 shrink-0"
                    onClick={() => markSeen({ reminderId: reminder._id })}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </Section>
          )}

          {/* Upcoming Reminders (next 7 days) */}
          {upcoming.length > 0 && (
            <Section
              icon={<Calendar className="w-3.5 h-3.5 text-blue-500" />}
              title="Upcoming (7d)"
              count={upcoming.length}
              color="blue"
            >
              {upcoming.slice(0, 5).map((reminder) => (
                <div
                  key={reminder._id}
                  className="flex items-center justify-between p-2 rounded-md bg-blue-500/5 border border-blue-500/10"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-blue-500 font-bold capitalize shrink-0">
                      {formatRelativeTime(reminder.remindAt)}
                    </span>
                    {reminder.notes && (
                      <span className="text-xs text-muted-foreground truncate">
                        {reminder.notes}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Section>
          )}

          {/* Never Contacted */}
          {hygiene.neverContacted.length > 0 && (
            <Section
              icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              title="Never Contacted"
              count={hygiene.neverContacted.length}
              color="rose"
            >
              {hygiene.neverContacted.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-2 rounded-md bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  onClick={() => openDetail(client._id)}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-bold text-foreground truncate">
                      {client.companyName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Created on {new Date(client.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <DelayBadge createdAt={client.createdAt} currentTime={currentTime} />
                </div>
              ))}
            </Section>
          )}

          {/* Cold Prospects */}
          {hygiene.cold.length > 0 && (
            <Section
              icon={<Snowflake className="w-3.5 h-3.5 text-cyan-500" />}
              title="Cold Prospects"
              count={hygiene.cold.length}
              color="cyan"
            >
              {hygiene.cold.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-2 rounded-md bg-cyan-500/5 border border-cyan-500/10 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  onClick={() => openDetail(client._id)}
                >
                  <span className="text-xs font-bold text-foreground truncate">
                    {client.companyName}
                  </span>
                  <span className="text-[10px] text-cyan-600 font-bold shrink-0">
                    {client.lastInteractionAt
                      ? formatRelativeTime(client.lastInteractionAt)
                      : "Never contacted"}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Stale Verbal Agreements */}
          {hygiene.staleVerbal.length > 0 && (
            <Section
              icon={<AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
              title="Stale Verbal Agreements"
              count={hygiene.staleVerbal.length}
              color="orange"
            >
              {hygiene.staleVerbal.map((client) => (
                <div
                  key={client._id}
                  className="flex items-center justify-between p-2 rounded-md bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors cursor-pointer"
                  onClick={() => openDetail(client._id)}
                >
                  <span className="text-xs font-bold text-foreground truncate">
                    {client.companyName}
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold shrink-0">
                    {formatRelativeTime(client.updatedAt)}
                  </span>
                </div>
              ))}
            </Section>
          )}

          {/* Empty state */}
          {totalAlerts === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 space-y-3">
                    <Inbox className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs font-black uppercase tracking-widest text-center">
                Perfect Action center!
              </p>
              <p className="text-[10px] font-medium text-muted-foreground/60 text-center max-w-xs leading-normal">
                No action required
              </p>
            </div>
          )}
        </CardContent>
      </ScrollArea>

      <ClientDetailSheet
        clientId={selectedClientId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </Card>
    </div>
  );
}

// ─── Delay Badge helper ─────────────────────────────────────────
function DelayBadge({ createdAt, currentTime }: { createdAt: number; currentTime: number }) {
  const diffMs = currentTime - createdAt;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  let label = "";
  let colors = "";

  if (diffHours >= 72) {
    label = "+72h";
    colors = "bg-rose-500/15 text-rose-600 border-rose-500/20";
  } else if (diffHours >= 48) {
    label = "+48h";
    colors = "bg-orange-600/15 text-orange-700 border-orange-600/20";
  } else if (diffHours >= 24) {
    label = "+24h";
    colors = "bg-amber-500/15 text-amber-600 border-amber-500/20";
  } else {
    label = "+12h";
    colors = "bg-yellow-500/15 text-yellow-600 border-yellow-500/20";
  }

  return (
    <Badge variant="outline" className={`text-[9px] font-black h-4 px-1 ${colors}`}>
      {label}
    </Badge>
  );
}

// ─── Section helper ────────────────────────────────────────────
function Section({
  icon,
  title,
  count,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-0.5">
        {icon}
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        <Badge
          variant="outline"
          className={`text-[9px] text-center h-4  font-black bg-${color}-500/10 text-${color}-500 border-${color}-500/20`}
        >
          {count}
        </Badge>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
