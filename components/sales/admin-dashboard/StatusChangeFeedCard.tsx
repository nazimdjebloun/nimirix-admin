"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientStatusBadge } from "../dashboard/crm-badges";
import { format, formatDistanceToNow } from "date-fns";
import { History, ArrowRight, Loader2, User, Building2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue ,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;

export function StatusChangeFeedCard() {
  const [searchRep, setSearchRep] = useState("");
  const [searchClient, setSearchClient] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { results, status, loadMore } = usePaginatedQuery(
    api.sales.admin.queries.getAdminStatusChangeFeed,
    { 
      searchRep, 
      searchClient, 
      statusFilter 
    },
    { initialNumItems: ITEMS_PER_PAGE }
  );

  return (
    <Card className="flex flex-col shadow-sm border bg-card p-0">
      <CardHeader className="p-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center justify-between mb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <History className="h-4 w-4 text-primary" />
            Status Updates
          </CardTitle>
          <Badge variant="outline" className="text-[10px] font-semibold px-1.5 border-primary/20 text-primary">Pipeline</Badge>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Agent (Name)..."
              className="pl-9 font-medium"
              value={searchRep}
              onChange={(e) => setSearchRep(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="relative col-span-3">
              <Building2 className="absolute left-2.5 top-2.25 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Client..."
                className="pl-9 font-medium"
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="font-medium">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="initial_contact">Initial Contact</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="verbal_agreement">Verbal Agreement</SelectItem>
                    </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="h-120">
        <CardContent className="p-4 space-y-4">
          {results.length === 0 && status !== "LoadingFirstPage" ? (
            <div className="text-center py-10 text-muted-foreground text-xs font-semibold">
              {status === "LoadingMore" ? <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" /> : "No updates"}
            </div>
          ) : (
            <>
              {results.map((item) => (
                <div key={item._id} className="relative pl-4 border-l-2 border-neutral-100 pb-4 last:pb-0">
                  <div className="absolute -left-2.25 top-0 h-4 w-4 rounded-full bg-white flex items-center justify-center border-2 border-neutral-100">
                    <ArrowRight className="h-2 w-2 text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {item.userName.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs font-bold text-foreground">
                          {item.userName}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {format(item.createdAt, "MMM d, yyyy 'at' HH:mm")}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 group hover:border-border transition-all">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          Update for <span className="font-semibold text-foreground">@{item.clientName}</span>
                        </p>
                        <div className="flex items-center gap-2">
                          {item.oldStatus ? (
                            <>
                              <ClientStatusBadge status={item.oldStatus} />
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </>
                          ) : null}
                          <ClientStatusBadge status={item.newStatus} />
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-muted-foreground italic font-medium mt-1">
                            &quot;{item.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {status === "CanLoadMore" && (
                <div className="flex justify-center pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted h-8"
                    onClick={() => loadMore(ITEMS_PER_PAGE)}
                  >
                    Load more changes...
                  </Button>
                </div>
              )}
              {status === "LoadingMore" && (
                <div className="flex justify-center pt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                </div>
              )}
            </>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
