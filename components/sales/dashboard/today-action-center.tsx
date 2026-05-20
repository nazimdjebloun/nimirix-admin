"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ClientDetailSheet } from "@/components/sales/dashboard/client-detail-sheet"
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
  ClipboardCheck,
} from "lucide-react"
import {
  formatTimeOnly as formatTime,
  formatRelativeTime,
} from "@/lib/utils/date-utils"
import { Id } from "@/convex/_generated/dataModel"
import { UpdateMeetingStatusDialog } from "@/components/sales/dashboard/update-meeting-status-dialog"
import { UpdateInteractionStatusDialog } from "@/components/sales/dashboard/update-interaction-status-dialog"

interface Reminder {
  _id: Id<"crmReminders">
  userId: string
  clientId?: Id<"clients">
  entityType: "client" | "contact" | "meeting" | "interaction"
  entityId?: string
  remindAt: number
  notes?: string
  isSent: boolean
  isSeen: boolean
  createdAt: number
}

interface Meeting {
  _id: Id<"clientMeetings">
  clientId: Id<"clients">
  userId: string
  scheduledAt: number
  type: "in_office" | "remote" | "client_office"
  location?: string
  status: "scheduled" | "completed" | "missed" | "cancelled"
  notes?: string
  createdAt: number
  updatedAt: number
}

interface Interaction {
  _id: Id<"clientInteractions">
  clientId: Id<"clients">
  userId: string
  type: "call" | "email"
  scheduledAt: number
  status: "scheduled" | "completed" | "missed" | "no_response"
  notes?: string
  createdAt: number
  updatedAt: number
}

interface ColdProspect {
  _id: Id<"clients">
  companyName: string
  status: string
  createdAt: number
  lastInteractionAt?: number
}

interface StaleVerbal {
  _id: Id<"clients">
  companyName: string
  status: string
  updatedAt: number
}

interface TodayActionCenterProps {
  today: (Reminder | Meeting | Interaction)[]
  upcoming: Reminder[]
  hygiene: {
    cold: ColdProspect[]
    staleVerbal: StaleVerbal[]
    neverContacted: ColdProspect[]
    hotList: ColdProspect[]
  }
  currentTime: number
}

function isReminder(item: Reminder | Meeting | Interaction): item is Reminder {
  return "remindAt" in item
}

function isMeeting(item: Reminder | Meeting | Interaction): item is Meeting {
  return (
    !isReminder(item) &&
    "type" in item &&
    (item.type === "remote" ||
      item.type === "in_office" ||
      item.type === "client_office")
  )
}

function isInteraction(
  item: Reminder | Meeting | Interaction
): item is Interaction {
  return (
    !isReminder(item) &&
    "type" in item &&
    (item.type === "call" || item.type === "email")
  )
}

export function TodayActionCenter({
  today,
  upcoming,
  hygiene,
  currentTime,
}: TodayActionCenterProps) {
  const [selectedClientId, setSelectedClientId] =
    useState<Id<"clients"> | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusMeeting, setStatusMeeting] = useState<Meeting | null>(null)
  const [interactionToUpdate, setInteractionToUpdate] =
    useState<Interaction | null>(null)
  const markSeen = useMutation(
    api.sales.actionCenter.mutations.markReminderSeen
  )

  const openDetail = (clientId: Id<"clients">) => {
    setSelectedClientId(clientId)
    setDetailOpen(true)
  }

  const reminders = today.filter(isReminder)
  const meetings = today.filter(isMeeting)
  const interactions = today.filter(isInteraction)

  const totalAlerts =
    reminders.length +
    meetings.length +
    interactions.length +
    hygiene.cold.length +
    hygiene.staleVerbal.length +
    hygiene.neverContacted.length +
    hygiene.hotList.length

  return (
    <div>
      <Card className="flex h-[400px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/40 shadow-xs">
        <CardHeader className="shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between px-1">
            <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
              <Zap className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              Action Center
            </CardTitle>
            {totalAlerts > 0 && (
              <Badge className="border-amber-500/20 bg-amber-500/15 text-[10px] font-black tracking-wider text-amber-600 uppercase">
                {totalAlerts} action{totalAlerts > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="min-h-0 flex-1">
          <CardContent className="space-y-4 p-4 pt-1">
            {/* Hot List (High Priority) */}
            {hygiene.hotList && hygiene.hotList.length > 0 && (
              <Section
                icon={
                  <Zap className="h-3.5 w-3.5 animate-pulse fill-orange-500 text-orange-500" />
                }
                title="Hot Leads 🔥"
                count={hygiene.hotList.length}
                color="orange"
              >
                {hygiene.hotList.map((client) => (
                  <div
                    key={client._id}
                    className="group flex cursor-pointer items-center justify-between rounded-md border border-orange-500/20 bg-orange-500/10 p-2 transition-colors hover:bg-orange-500/20"
                    onClick={() => openDetail(client._id)}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-1.5 truncate text-xs font-black text-orange-700 dark:text-orange-400">
                        {client.companyName}
                      </span>
                      <span className="text-[10px] font-bold tracking-wider text-orange-600/80 uppercase dark:text-orange-400/80">
                        {client.status.replace("_", " ")}
                      </span>
                    </div>
                    <Badge className="h-5 border-0 bg-orange-500 px-1.5 text-[10px] font-black text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600">
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
                icon={<Video className="h-3.5 w-3.5 text-violet-500" />}
                title="Meetings Today"
                count={meetings.length}
                color="violet"
              >
                {meetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    className="flex items-center justify-between rounded-md border border-violet-500/10 bg-violet-500/5 p-2 transition-colors hover:bg-violet-500/10"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setStatusMeeting(meeting)}
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-violet-600">
                        <Clock className="h-3 w-3" />
                        {formatTime(meeting.scheduledAt)}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
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
                      className="shrink-0 cursor-pointer text-[10px] transition-colors hover:bg-violet-500/20"
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
                icon={<Zap className="h-3.5 w-3.5 text-blue-500" />}
                title="Calls & Emails"
                count={interactions.length}
                color="blue"
              >
                {interactions.map((interaction) => (
                  <div
                    key={interaction._id}
                    className="flex items-center justify-between rounded-md border border-blue-500/10 bg-blue-500/5 p-2 transition-colors hover:bg-blue-500/10"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setInteractionToUpdate(interaction)}
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                      >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                      </Button>
                      <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600">
                        <Clock className="h-3 w-3" />
                        {formatTime(interaction.scheduledAt)}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">
                        {interaction.type === "call" ? "Call" : "Email"}
                        {interaction.notes && ` — ${interaction.notes}`}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 cursor-pointer text-[10px] transition-colors hover:bg-blue-500/20"
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
                icon={<Bell className="h-3.5 w-3.5 text-amber-500" />}
                title="Today's Reminders"
                count={reminders.length}
                color="amber"
              >
                {reminders.map((reminder) => (
                  <div
                    key={reminder._id}
                    className="flex items-center justify-between rounded-md border border-amber-500/10 bg-amber-500/5 p-2 transition-colors hover:bg-amber-500/10"
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider text-amber-600 uppercase">
                          {reminder.entityType === "meeting"
                            ? "Meeting"
                            : reminder.entityType === "interaction"
                              ? "Interaction"
                              : reminder.entityType === "contact"
                                ? "Contact"
                                : "Client"}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {formatTime(reminder.remindAt)}
                        </span>
                      </div>
                      {reminder.notes && (
                        <p className="truncate text-xs text-muted-foreground">
                          {reminder.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-amber-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                      onClick={() => markSeen({ reminderId: reminder._id })}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </Section>
            )}

            {/* Upcoming Reminders (next 7 days) */}
            {upcoming.length > 0 && (
              <Section
                icon={<Calendar className="h-3.5 w-3.5 text-blue-500" />}
                title="Upcoming (7d)"
                count={upcoming.length}
                color="blue"
              >
                {upcoming.slice(0, 5).map((reminder) => (
                  <div
                    key={reminder._id}
                    className="flex items-center justify-between rounded-md border border-blue-500/10 bg-blue-500/5 p-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-[10px] font-bold text-blue-500 capitalize">
                        {formatRelativeTime(reminder.remindAt)}
                      </span>
                      {reminder.notes && (
                        <span className="truncate text-xs text-muted-foreground">
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
                icon={<AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                title="Never Contacted"
                count={hygiene.neverContacted.length}
                color="rose"
              >
                {hygiene.neverContacted.map((client) => (
                  <div
                    key={client._id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-rose-500/10 bg-rose-500/5 p-2 transition-colors hover:bg-rose-500/10"
                    onClick={() => openDetail(client._id)}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-xs font-bold text-foreground">
                        {client.companyName}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Created on{" "}
                        {new Date(client.createdAt).toLocaleDateString(
                          "en-US",
                          { day: "2-digit", month: "short" }
                        )}
                      </span>
                    </div>
                    <DelayBadge
                      createdAt={client.createdAt}
                      currentTime={currentTime}
                    />
                  </div>
                ))}
              </Section>
            )}

            {/* Cold Prospects */}
            {hygiene.cold.length > 0 && (
              <Section
                icon={<Snowflake className="h-3.5 w-3.5 text-cyan-500" />}
                title="Cold Prospects"
                count={hygiene.cold.length}
                color="cyan"
              >
                {hygiene.cold.map((client) => (
                  <div
                    key={client._id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-cyan-500/10 bg-cyan-500/5 p-2 transition-colors hover:bg-cyan-500/10"
                    onClick={() => openDetail(client._id)}
                  >
                    <span className="truncate text-xs font-bold text-foreground">
                      {client.companyName}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-cyan-600">
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
                icon={<AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
                title="Stale Verbal Agreements"
                count={hygiene.staleVerbal.length}
                color="orange"
              >
                {hygiene.staleVerbal.map((client) => (
                  <div
                    key={client._id}
                    className="flex cursor-pointer items-center justify-between rounded-md border border-orange-500/10 bg-orange-500/5 p-2 transition-colors hover:bg-orange-500/10"
                    onClick={() => openDetail(client._id)}
                  >
                    <span className="truncate text-xs font-bold text-foreground">
                      {client.companyName}
                    </span>
                    <span className="shrink-0 text-[10px] font-bold text-orange-600">
                      {formatRelativeTime(client.updatedAt)}
                    </span>
                  </div>
                ))}
              </Section>
            )}

            {/* Empty state */}
            {totalAlerts === 0 && (
              <div className="flex flex-col items-center justify-center space-y-3 py-12 text-muted-foreground/40">
                <Inbox className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-center text-xs font-black tracking-widest uppercase">
                  Perfect Action center!
                </p>
                <p className="max-w-xs text-center text-[10px] leading-normal font-medium text-muted-foreground/60">
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
  )
}

// ─── Delay Badge helper ─────────────────────────────────────────
function DelayBadge({
  createdAt,
  currentTime,
}: {
  createdAt: number
  currentTime: number
}) {
  const diffMs = currentTime - createdAt
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  let label = ""
  let colors = ""

  if (diffHours >= 72) {
    label = "+72h"
    colors = "bg-rose-500/15 text-rose-600 border-rose-500/20"
  } else if (diffHours >= 48) {
    label = "+48h"
    colors = "bg-orange-600/15 text-orange-700 border-orange-600/20"
  } else if (diffHours >= 24) {
    label = "+24h"
    colors = "bg-amber-500/15 text-amber-600 border-amber-500/20"
  } else {
    label = "+12h"
    colors = "bg-yellow-500/15 text-yellow-600 border-yellow-500/20"
  }

  return (
    <Badge
      variant="outline"
      className={`h-4 px-1 text-[9px] font-black ${colors}`}
    >
      {label}
    </Badge>
  )
}

// ─── Section helper ────────────────────────────────────────────
function Section({
  icon,
  title,
  count,
  color,
  children,
}: {
  icon: React.ReactNode
  title: string
  count: number
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 px-0.5">
        {icon}
        <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
          {title}
        </span>
        <Badge
          variant="outline"
          className={`h-4 text-center text-[9px] font-black bg-${color}-500/10 text-${color}-500 border-${color}-500/20`}
        >
          {count}
        </Badge>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
