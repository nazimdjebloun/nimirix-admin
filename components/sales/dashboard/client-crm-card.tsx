"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPipelinePriorityColor } from "@/components/sales/lib/helpers";

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
} from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { StatusBadgeDropdown } from "./client-status-update";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { CreateInteractionDialog } from "./create-interaction-dialog";
import { ClientDetailSheet } from "./client-detail-sheet";
import { ClientTimelineSheet } from "./client-timeline-sheet";
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils";
import { EditProspectDialog } from "@/components/sales/pipeline/edit-prospect-dialog";



interface ClientCrmCardProps {
  client: Doc<"clients"> & { salesPerson?: { name: string } | null };
}

export function ClientCrmCard({ client }: ClientCrmCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [createInteractionOpen, setCreateInteractionOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card className="group overflow-hidden transition-all duration-200 bg-card p-0">
      <CardHeader className="border-b p-2.5">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md px-2 font-bold uppercase text-[9px] tracking-wider shrink-0",
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
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <CardTitle className="text-sm font-bold text-foreground min-w-0 leading-tight">
                <span className="truncate block" title={client.companyName}>{client.companyName}</span>
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold min-w-0">
                <User className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span className="truncate">{client.contact}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <div className="flex gap-1.5 px-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-[10px] font-black uppercase tracking-wider gap-1 border-border/40  text-muted-foreground  shrink-0"
          onClick={() => setDetailOpen(true)}
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-[10px] font-black uppercase tracking-wider gap-1 border-border/40  text-muted-foreground  shrink-0"
          onClick={() => setTimelineOpen(true)}
        >
          <History className="w-3.5 h-3.5" />
          Timeline
        </Button>
      </div>


      <CardContent className="p-2 ">

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-[11px] text-foreground font-medium">
            <Mail className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate" title={client.email}>
              {client.email || <span className="opacity-40">—</span>}</span>
          </div>


          <div className="flex items-center gap-2 text-[11px] text-foreground font-medium">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate" title={client.address || undefined}>
              {client.address || <span className="opacity-40">—</span>}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-foreground font-medium">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="truncate" title={client.activity || undefined}>
              {client.activity || <span className="opacity-40">—</span>}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-foreground/75 font-semibold uppercase tracking-wide">Created</span>
            <span className="font-bold text-foreground/80 bg-muted/55 px-1.5  rounded-sm border border-border/30">
              {formatDateTimeShortMonth(client.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-foreground font-medium">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-foreground/75 font-semibold uppercase tracking-wide">Updated</span>
            <span className="font-bold text-foreground/80 bg-muted/55 px-1.5  rounded-sm border border-border/30">
              {formatDateTimeShortMonth(client.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2! border-t flex gap-2 bg-muted">
        <Button
          onClick={() => setCreateMeetingOpen(true)}
          variant="default"
          className="flex-1 flex flex-col  h-fit py-1 "
        >
          <Video />
          <span>Meeting</span>
        </Button>
        <Button
          onClick={() => setCreateInteractionOpen(true)}
          variant="default"
          className="flex-1 flex flex-col  h-fit py-1"
        >
          <MessageSquare />
          <span>Interaction</span>
        </Button>
      </CardFooter>

      <CreateMeetingDialog clientId={client._id} companyName={client.companyName} open={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen} />
      <CreateInteractionDialog clientId={client._id} companyName={client.companyName} open={createInteractionOpen}
        onOpenChange={setCreateInteractionOpen} />

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
  );
}

