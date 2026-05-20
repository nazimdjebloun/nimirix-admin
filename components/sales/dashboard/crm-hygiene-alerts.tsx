"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useMemo } from "react"
import {
  ShieldAlert,
  Snowflake,
  Phone,
  Calendar,
  AlertTriangle,
  Inbox,
} from "lucide-react"
import { CreateInteractionDialog } from "./create-interaction-dialog"
import { CreateMeetingDialog } from "./create-meeting-dialog"
import { Id } from "@/convex/_generated/dataModel"
import { Spinner } from "@/components/ui/spinner"

interface CrmHygieneAlertsProps {
  currentTime?: number
}

export function CrmHygieneAlerts({
  currentTime: propCurrentTime,
}: CrmHygieneAlertsProps) {
  const localCurrentTime = useMemo(() => new Date().getTime(), [])
  const currentTime = propCurrentTime ?? localCurrentTime
  const alerts = useQuery(api.sales.actionCenter.queries.getCrmHygieneAlerts, {
    currentTime,
  })

  // Dialog State
  const [selectedClient, setSelectedClient] = useState<{
    id: Id<"clients">
    companyName: string
  } | null>(null)
  const [interactionOpen, setInteractionOpen] = useState(false)
  const [meetingOpen, setMeetingOpen] = useState(false)

  const handleAction = (
    clientId: Id<"clients">,
    companyName: string,
    actionType: "call" | "meeting"
  ) => {
    setSelectedClient({ id: clientId, companyName })
    if (actionType === "call") {
      setInteractionOpen(true)
    } else {
      setMeetingOpen(true)
    }
  }

  const staleLeadsCount = alerts
    ? alerts.filter((a) => a.type === "stale_lead").length
    : 0
  const leakingLeadsCount = alerts
    ? alerts.filter((a) => a.type === "leaking_lead").length
    : 0

  return (
    <div>
      <Card className="flex h-[400px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/40 shadow-xs">
        <CardHeader className="shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between px-1">
            <CardTitle className="flex items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
              <ShieldAlert className="h-4 w-4 animate-pulse text-rose-500" />
              CRM Hygiene & Stale Leads
            </CardTitle>
            {alerts && alerts.length > 0 && (
              <Badge className="border-rose-500/20 bg-rose-500/15 text-[10px] font-black tracking-wider text-rose-600 uppercase">
                {alerts.length} warning{alerts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="min-h-0 flex-1">
          <CardContent className="space-y-4 p-4 pt-1">
            {alerts === undefined ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner className="h-6 w-6 text-rose-500" />
                <p className="mt-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Evaluating lead health...
                </p>
              </div>
            ) : (
              <>
                {/* Stale Leads Section */}
                {staleLeadsCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Snowflake className="h-3.5 w-3.5 text-cyan-500" />
                      <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Stale Leads (&gt;14 days inactive)
                      </span>
                      <Badge
                        variant="outline"
                        className="border-cyan-500/20 bg-cyan-500/10 text-[9px] font-black text-cyan-500"
                      >
                        {staleLeadsCount}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {alerts
                        .filter((a) => a.type === "stale_lead")
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="flex flex-col justify-between gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 transition-all duration-200 hover:bg-cyan-500/10 sm:flex-row sm:items-center"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">
                                  {alert.client.companyName}
                                </span>
                                <Badge className="border-0 bg-cyan-500/15 text-[9px] font-bold text-cyan-700 dark:text-cyan-400">
                                  STALE
                                </Badge>
                              </div>
                              <p className="text-[11px] leading-relaxed text-muted-foreground">
                                {alert.message}
                              </p>
                            </div>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleAction(
                                  alert.client.id,
                                  alert.client.companyName,
                                  alert.actionType
                                )
                              }
                              className="shrink-0 border-cyan-500/20 text-[10px] font-black tracking-wider text-cyan-600 uppercase hover:bg-cyan-500 hover:text-white"
                            >
                              <Phone className="mr-1 h-3 w-3" />
                              Qualify Call
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Leaking Leads Section */}
                {leakingLeadsCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Leaking Leads (&gt;10 days silent)
                      </span>
                      <Badge
                        variant="outline"
                        className="border-amber-500/20 bg-amber-500/10 text-[9px] font-black text-amber-500"
                      >
                        {leakingLeadsCount}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {alerts
                        .filter((a) => a.type === "leaking_lead")
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="flex flex-col justify-between gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 transition-all duration-200 hover:bg-amber-500/10 sm:flex-row sm:items-center"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">
                                  {alert.client.companyName}
                                </span>
                                <Badge className="border-0 bg-amber-500/15 text-[9px] font-bold text-amber-700 dark:text-amber-400">
                                  LEAKING
                                </Badge>
                              </div>
                              <p className="text-[11px] leading-relaxed text-muted-foreground">
                                {alert.message}
                              </p>
                            </div>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                handleAction(
                                  alert.client.id,
                                  alert.client.companyName,
                                  alert.actionType
                                )
                              }
                              className="shrink-0 border-amber-500/20 text-[10px] font-black tracking-wider text-amber-600 uppercase hover:bg-amber-500 hover:text-white"
                            >
                              {alert.actionType === "call" ? (
                                <>
                                  <Phone className="mr-1 h-3 w-3" />
                                  Schedule Call
                                </>
                              ) : (
                                <>
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Schedule Meeting
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {alerts.length === 0 && (
                  <div className="flex flex-col items-center justify-center space-y-3 py-12 text-muted-foreground/40">
                    <Inbox className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-center text-xs font-black tracking-widest uppercase">
                      Perfect CRM Hygiene!
                    </p>
                    <p className="max-w-xs text-center text-[10px] leading-normal font-medium text-muted-foreground/60">
                      All active leads have recent interactions or meetings.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Render Dialogs */}
      {selectedClient && (
        <>
          <CreateInteractionDialog
            clientId={selectedClient.id}
            companyName={selectedClient.companyName}
            open={interactionOpen}
            onOpenChange={setInteractionOpen}
          />
          <CreateMeetingDialog
            clientId={selectedClient.id}
            companyName={selectedClient.companyName}
            open={meetingOpen}
            onOpenChange={setMeetingOpen}
          />
        </>
      )}
    </div>
  )
}
