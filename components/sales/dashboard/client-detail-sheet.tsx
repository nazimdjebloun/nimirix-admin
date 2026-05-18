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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Video,
  PhoneCall,
  MailCheck,
  ArrowRight,
  Loader2,
  Activity,
} from "lucide-react";
import { formatDateTimeShortMonth, formatDateTime, formatRelativeTime } from "@/lib/utils/date-utils";
import { Id } from "@/convex/_generated/dataModel";
import { MeetingTypeBadge, ClientStatusBadge } from "@/components/sales/dashboard/crm-badges";
interface ClientDetailSheetProps {
  clientId: Id<"clients"> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientDetailSheet({ clientId, open, onOpenChange }: ClientDetailSheetProps) {
  const data = useQuery(
    api.sales.dashboard.queries.getClientCrmDetails,
    clientId ? { clientId } : "skip"
  );

  const client = data?.client;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} >
      <SheetContent side="right" className="w-full sm:max-w-2xl! p-0 flex flex-col">
        <SheetTitle > </SheetTitle>

        {!data ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
          </div>
        ) : !client ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Client not found
          </div>
        ) : (
          <>
            {/* Header */}
            <SheetHeader className="p-4 pb-3 border-b bg-secondary/5 shrink-0">
              <div className="flex justify-between items-start pr-8">
                <div className="space-y-1">
                  <SheetTitle className="text-lg font-black flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {client.companyName}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {client.contact}
                  </SheetDescription>
                </div>
                {client && (
                  <ClientStatusBadge status={client.status} />
                )}
              </div>
              {data.salesPerson && (
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                  Sales rep: {data.salesPerson.name}
                </p>
              )}
            </SheetHeader>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-5">

                {/* ─── Client Info ─────────────────────────── */}
                <Section title="Information" icon={<Building2 className="w-3.5 h-3.5" />}>
                  <div className="grid gap-2">
                    <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={client.email} />
                    {client.phone && <InfoRow icon={<Phone className="w-3 h-3" />} label="Phone" value={client.phone} />}
                    {client.address && <InfoRow icon={<MapPin className="w-3 h-3" />} label="Address" value={client.address} />}
                    {client.activity && <InfoRow icon={<Briefcase className="w-3 h-3" />} label="Activity" value={client.activity} />}
                    <InfoRow icon={<Calendar className="w-3 h-3" />} label="Created at" value={formatDateTimeShortMonth(client.createdAt)} />
                    <InfoRow icon={<Clock className="w-3 h-3" />} label="Last updated" value={formatDateTimeShortMonth(client.updatedAt)} />
                    {client.nif && <InfoRow icon={<Briefcase className="w-3 h-3" />} label="NIF" value={client.nif} />}
                    {client.notes && (
                      <div className="mt-1 p-2 rounded-md bg-secondary/10 border border-border/30">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Notes</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </Section>

                <Separator />

                {/* ─── Interaction Stats ───────────────────── */}
                <Section title="Interactions" icon={<PhoneCall className="w-3.5 h-3.5" />}>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Calls */}
                    <StatBlock
                      title="Calls"
                      icon={<PhoneCall className="w-3 h-3 text-indigo-500" />}
                      total={data.interactionStats.totalCalls}
                      items={[
                        { label: "Completed", value: data.interactionStats.completedCalls, color: "text-emerald-500" },
                        { label: "Missed", value: data.interactionStats.missedCalls, color: "text-amber-500" },
                        { label: "No response", value: data.interactionStats.noResponseCalls, color: "text-red-500" },
                        { label: "Scheduled", value: data.interactionStats.scheduledCalls, color: "text-blue-500" },
                      ]}
                    />
                    {/* Emails */}
                    <StatBlock
                      title="Emails"
                      icon={<MailCheck className="w-3 h-3 text-emerald-500" />}
                      total={data.interactionStats.totalEmails}
                      items={[
                        { label: "Completed", value: data.interactionStats.completedEmails, color: "text-emerald-500" },
                        { label: "Missed", value: data.interactionStats.missedEmails, color: "text-amber-500" },
                        { label: "No response", value: data.interactionStats.noResponseEmails, color: "text-red-500" },
                        { label: "Scheduled", value: data.interactionStats.scheduledEmails, color: "text-blue-500" },
                      ]}
                    />
                  </div>

                  {data.lastInteraction && (
                    <div className="mt-3 p-2.5 rounded-lg bg-secondary/5 border border-border/30">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                        Last interaction
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">
                          {data.lastInteraction.type === "call" ? "Call" : "Email"}
                        </Badge>
                        <span className="text-muted-foreground font-bold">
                          {formatRelativeTime(data.lastInteraction.scheduledAt)}
                        </span>
                      </div>
                      {data.lastInteraction.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.lastInteraction.notes}</p>
                      )}
                    </div>
                  )}
                </Section>

                <Separator />

                {/* ─── Meeting Stats ──────────────────────── */}
                <Section title="Meetings" icon={<Video className="w-3.5 h-3.5" />}>
                  <div className="grid grid-cols-5 gap-2">
                    <MiniStat label="Total" value={data.meetingStats.total} />
                    <MiniStat label="Completed" value={data.meetingStats.completed} color="text-emerald-500" />
                    <MiniStat label="Scheduled" value={data.meetingStats.scheduled} color="text-blue-500" />
                    <MiniStat label="Missed" value={data.meetingStats.missed} color="text-amber-500" />
                    <MiniStat label="Cancelled" value={data.meetingStats.cancelled} color="text-red-500" />
                  </div>

                  {data.lastMeeting && (
                    <div className="mt-3 p-2.5 rounded-lg bg-secondary/5 border border-border/30">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
                        Last meeting
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <MeetingTypeBadge type={data.lastMeeting.type} />   
                        <span className="text-muted-foreground font-bold">   
                          {formatDateTime(data.lastMeeting.scheduledAt)}
                        </span>
                      </div>
                      {data.lastMeeting.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.lastMeeting.notes}</p>
                      )}
                    </div>
                  )}
                </Section>

                <Separator />

                {/* ─── Status Change Log ──────────────────── */}
                <Section title="Status History" icon={<Activity className="w-3.5 h-3.5" />}>
                  <div className="mt-2 border rounded-lg bg-secondary/5 overflow-hidden">
                    <ScrollArea className="h-64">
                      {data.statusLog.length === 0 ? (
                        <p className="text-xs text-muted-foreground/50 text-center py-8">No status changes</p>
                      ) : (
                        <div className="p-4 space-y-0">
                          {data.statusLog.map((log: { _id: string; oldStatus?: string; newStatus: string; userName: string; createdAt: number; notes?: string }, i: number) => {
                            return (
                              <div key={log._id} className="relative pl-5 pb-4 last:pb-0">
                                {/* Timeline line */}
                                {i < data.statusLog.length - 1 && (
                                  <div className="absolute left-1.75 top-3 bottom-0 w-px bg-border/50" />
                                )}
                                {/* Timeline dot */}
                                <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-primary/60 bg-card" />

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {log.oldStatus && (
                                      <>
                                        <ClientStatusBadge 
                                          status={log.oldStatus} 
                                          className="text-[9px] font-bold h-4 px-1" 
                                        />
                                        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                                      </>
                                    )}
                                    <ClientStatusBadge 
                                      status={log.newStatus} 
                                      className="text-[9px] font-bold h-4 px-1" 
                                    />
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                    <span className="font-semibold">{log.userName}</span>
                                    <span>•</span>
                                    <span>{formatDateTime(log.createdAt)}</span>
                                  </div>
                                  {log.notes && (
                                    <p className="text-[10px] text-muted-foreground/70 italic">{log.notes}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </Section>

              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Helper components ────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-primary/60">{icon}</span>
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground/60">{icon}</span>
      <span className="text-muted-foreground font-bold w-24 shrink-0">{label}</span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}

function StatBlock({
  title,
  icon,
  total,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  total: number;
  items: { label: string; value: number; color: string }[];
}) {
  return (
    <div className="p-2.5 rounded-lg border border-border/30 bg-secondary/5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <span className="text-lg font-black text-foreground">{total}</span>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground font-medium">{item.label}</span>
            <span className={`font-black ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = "text-foreground" }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center p-2 rounded-md bg-secondary/5 border border-border/30">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  );
}
