"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { ShieldAlert, Snowflake, Phone, Calendar, AlertTriangle, Inbox } from "lucide-react";
import { CreateInteractionDialog } from "./create-interaction-dialog";
import { CreateMeetingDialog } from "./create-meeting-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Spinner } from "@/components/ui/spinner";

interface CrmHygieneAlertsProps {
  currentTime?: number;
}

export function CrmHygieneAlerts({ currentTime: propCurrentTime }: CrmHygieneAlertsProps) {
  const localCurrentTime = useMemo(() => new Date().getTime(), []);
  const currentTime = propCurrentTime ?? localCurrentTime;
  const alerts = useQuery(api.sales.actionCenter.queries.getCrmHygieneAlerts, { currentTime });

  // Dialog State
  const [selectedClient, setSelectedClient] = useState<{ id: Id<"clients">; companyName: string } | null>(null);
  const [interactionOpen, setInteractionOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);

  const handleAction = (clientId: Id<"clients">, companyName: string, actionType: "call" | "meeting") => {
    setSelectedClient({ id: clientId, companyName });
    if (actionType === "call") {
      setInteractionOpen(true);
    } else {
      setMeetingOpen(true);
    }
  };

  const staleLeadsCount = alerts ? alerts.filter((a) => a.type === "stale_lead").length : 0;
  const leakingLeadsCount = alerts ? alerts.filter((a) => a.type === "leaking_lead").length : 0;

  return (
    <div>
      <Card className="bg-background/40  shadow-xs overflow-hidden flex flex-col h-full rounded-2xl border border-border/40">
        <CardHeader className="p-4 pb-2 shrink-0">
          <div className="flex justify-between items-center px-1">
            <CardTitle className="text-xs font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              CRM Hygiene & Stale Leads
            </CardTitle>
            {alerts && alerts.length > 0 && (
              <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/20 text-[10px] font-black uppercase tracking-wider">
                {alerts.length} warning{alerts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 min-h-75 max-h-112.5">
          <CardContent className="p-4 pt-1 space-y-4">
            {alerts === undefined ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner className="h-6 w-6 text-rose-500" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">
                  Evaluating lead health...
                </p>
              </div>
            ) : (
              <>
                {/* Stale Leads Section */}
                {staleLeadsCount > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Stale Leads (&gt;14 days inactive)
                      </span>
                      <Badge variant="outline" className="text-[9px] font-black bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                        {staleLeadsCount}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {alerts
                        .filter((a) => a.type === "stale_lead")
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 rounded-xl bg-cyan-500/5 border border-cyan-500/15 hover:bg-cyan-500/10 transition-all duration-200"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">
                                  {alert.client.companyName}
                                </span>
                                <Badge className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-0 text-[9px] font-bold">
                                  STALE
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {alert.message}
                              </p>
                            </div>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleAction(alert.client.id, alert.client.companyName, alert.actionType)}
                              className="shrink-0 text-[10px] font-black uppercase tracking-wider border-cyan-500/20 text-cyan-600 hover:bg-cyan-500 hover:text-white"
                            >
                              <Phone className="w-3 h-3 mr-1" />
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
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Leaking Leads (&gt;10 days silent)
                      </span>
                      <Badge variant="outline" className="text-[9px] font-black bg-amber-500/10 text-amber-500 border-amber-500/20">
                        {leakingLeadsCount}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {alerts
                        .filter((a) => a.type === "leaking_lead")
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 rounded-xl bg-amber-500/5 border border-amber-500/15 hover:bg-amber-500/10 transition-all duration-200"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">
                                  {alert.client.companyName}
                                </span>
                                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0 text-[9px] font-bold">
                                  LEAKING
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {alert.message}
                              </p>
                            </div>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => handleAction(alert.client.id, alert.client.companyName, alert.actionType)}
                              className="shrink-0 text-[10px] font-black uppercase tracking-wider border-amber-500/20 text-amber-600 hover:bg-amber-500 hover:text-white"
                            >
                              {alert.actionType === "call" ? (
                                <>
                                  <Phone className="w-3 h-3 mr-1" />
                                  Schedule Call
                                </>
                              ) : (
                                <>
                                  <Calendar className="w-3 h-3 mr-1" />
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
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 space-y-3">
                    <Inbox className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-xs font-black uppercase tracking-widest text-center">
                      Perfect CRM Hygiene!
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground/60 text-center max-w-xs leading-normal">
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
  );
}
