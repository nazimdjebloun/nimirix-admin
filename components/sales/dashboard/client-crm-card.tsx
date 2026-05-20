"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getPipelinePriorityColor } from "@/components/sales/lib/helpers"

import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  MessageSquare,
  Video,
  History,
  Pencil,
} from "lucide-react"
import { Doc } from "@/convex/_generated/dataModel"
import { StatusBadgeDropdown } from "./client-status-update"
import { CreateMeetingDialog } from "./create-meeting-dialog"
import { CreateInteractionDialog } from "./create-interaction-dialog"
import { ClientDetailSheet } from "./client-detail-sheet"
import { ClientTimelineSheet } from "./client-timeline-sheet"
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils"
import { EditProspectDialog } from "@/components/sales/pipeline/edit-lead-dialog"

interface ClientCrmCardProps {
  client: Doc<"clients"> & { salesPerson?: { name: string } | null }
}

export function ClientCrmCard({ client }: ClientCrmCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [timelineOpen, setTimelineOpen] = useState(false)
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false)
  const [createInteractionOpen, setCreateInteractionOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  return (
    <Card className="group overflow-hidden bg-card p-0 shadow-sm transition-all duration-200">
      <CardHeader className="border-b bg-muted/50 p-2.5">
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-md px-2 text-[9px] font-bold tracking-wider uppercase",
                getPipelinePriorityColor(client.priority)
              )}
            >
              {client.priority}
            </Badge>
            <div className="shrink-0">
              <StatusBadgeDropdown
                clientId={client._id}
                currentStatus={client.status}
              />
            </div>
          </div>
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-1">
              <CardTitle className="min-w-0 text-sm leading-tight font-bold text-foreground">
                <span className="block truncate" title={client.companyName}>
                  {client.companyName}
                </span>
              </CardTitle>
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <span className="truncate">{client.contact}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="flex gap-1.5 px-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 flex-1 shrink-0 gap-1 border-border/40 text-[10px] font-black tracking-wider text-muted-foreground uppercase"
          onClick={() => setDetailOpen(true)}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 flex-1 shrink-0 gap-1 border-border/40 text-[10px] font-black tracking-wider text-muted-foreground uppercase"
          onClick={() => setTimelineOpen(true)}
        >
          <History className="h-3.5 w-3.5" />
          Timeline
        </Button>
      </div>

      <CardContent className="p-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate" title={client.email}>
              {client.email || <span className="opacity-40">—</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate" title={client.address || undefined}>
              {client.address || <span className="opacity-40">—</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
            <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="truncate" title={client.activity || undefined}>
              {client.activity || <span className="opacity-40">—</span>}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="font-semibold tracking-wide text-foreground/75 uppercase">
              Created
            </span>
            <span className="rounded-sm border border-border/30 bg-muted/55 px-1.5 font-bold text-foreground/80">
              {formatDateTimeShortMonth(client.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
            <span className="font-semibold tracking-wide text-foreground/75 uppercase">
              Updated
            </span>
            <span className="rounded-sm border border-border/30 bg-muted/55 px-1.5 font-bold text-foreground/80">
              {formatDateTimeShortMonth(client.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t bg-muted p-2!">
        <Button
          onClick={() => setCreateMeetingOpen(true)}
          variant="default"
          className="flex h-fit flex-1 flex-col py-1"
        >
          <Video />
          <span>Meeting</span>
        </Button>
        <Button
          onClick={() => setCreateInteractionOpen(true)}
          variant="default"
          className="flex h-fit flex-1 flex-col py-1"
        >
          <MessageSquare />
          <span>Interaction</span>
        </Button>
      </CardFooter>

      <CreateMeetingDialog
        clientId={client._id}
        companyName={client.companyName}
        open={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
      />
      <CreateInteractionDialog
        clientId={client._id}
        companyName={client.companyName}
        open={createInteractionOpen}
        onOpenChange={setCreateInteractionOpen}
      />

      <ClientDetailSheet
        clientId={client._id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <ClientTimelineSheet
        clientId={client._id}
        companyName={client.companyName}
        open={timelineOpen}
        onOpenChange={setTimelineOpen}
      />

      <EditProspectDialog
        client={client as Parameters<typeof EditProspectDialog>[0]["client"]}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </Card>
  )
}
