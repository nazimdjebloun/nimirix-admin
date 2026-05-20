"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Inbox } from "lucide-react";

interface ClientData {
  _id: string;
  companyName: string;
}

interface UnassignedCardProps {
  clients: ClientData[];
}

export function UnassignedCard({ clients }: UnassignedCardProps) {
  return (
    <Card className="bg-background/40 shadow-xs overflow-hidden flex flex-col h-[320px] rounded-2xl border border-border/40 p-0">
      <CardHeader className="p-4 pb-2 shrink-0 border-b border-border/10 bg-muted/20">
        <div className="flex justify-between items-center px-1">
          <CardTitle className="text-xs font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Unassigned Leads
          </CardTitle>
          <Badge className="bg-indigo-500/15 text-indigo-600 border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
            {clients.length} Warning{clients.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 min-h-0">
        <CardContent className="p-4 space-y-2">
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40 space-y-3">
              <Inbox className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs font-black uppercase tracking-widest text-center">
                All Assigned!
              </p>
              <p className="text-[10px] font-medium text-muted-foreground/60 text-center max-w-[200px] leading-normal">
                No new leads are currently waiting in the pool.
              </p>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 hover:bg-indigo-500/10 transition-all duration-200 cursor-pointer group"
              >
                <span className="text-xs font-black text-foreground truncate pr-2">
                  {client.companyName}
                </span>
                <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-0 text-[9px] font-black tracking-wider uppercase">
                  NEW LEAD
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
