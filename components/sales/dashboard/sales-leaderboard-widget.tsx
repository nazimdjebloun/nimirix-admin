"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Target, Award, Sparkles, TrendingUp, User, Medal } from "lucide-react";
import { useMemo } from "react";
import { Spinner } from "@/components/ui/spinner";

interface SalesLeaderboardWidgetProps {
  currentTime?: number;
}

export function SalesLeaderboardWidget({ currentTime: propCurrentTime }: SalesLeaderboardWidgetProps) {
  const localCurrentTime = useMemo(() => new Date().getTime(), []);
  const currentTime = propCurrentTime ?? localCurrentTime;

  const data = useQuery(api.sales.dashboard.queries.getLeaderboardAndGoals, { currentTime });

  if (data === undefined) {
    return (
      <Card className="flex h-[380px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/40 p-6 backdrop-blur-md shadow-xs">
        <Spinner className="h-6 w-6 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-4">
          Loading leaderboard stats...
        </p>
      </Card>
    );
  }

  const { dailyGoals, monthlyGoals, leaderboard } = data;

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge className="bg-amber-500 text-white border-0 text-[10px] font-black p-1 rounded-full shrink-0 flex items-center justify-center w-5 h-5 shadow-sm shadow-amber-500/30">
            1
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-slate-400 text-white border-0 text-[10px] font-black p-1 rounded-full shrink-0 flex items-center justify-center w-5 h-5 shadow-sm shadow-slate-400/30">
            2
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-amber-700 text-white border-0 text-[10px] font-black p-1 rounded-full shrink-0 flex items-center justify-center w-5 h-5 shadow-sm shadow-amber-700/30">
            3
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-bold p-1 rounded-full shrink-0 flex items-center justify-center w-5 h-5">
            {index + 1}
          </Badge>
        );
    }
  };

  return (
    <div>
    <Card className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-0 backdrop-blur-md shadow-xs">
      <CardHeader className="p-4 pb-2 shrink-0 border-b bg-accent/20">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
            <Trophy className="w-4 h-4 text-amber-500 " />
            <span className="min-w-0 wrap-break-word">Performance & Team Leaderboard</span>
          </CardTitle>
          <Badge className="w-fit border-amber-500/20 bg-amber-500/15 text-[10px] font-black uppercase tracking-wider text-amber-600">
            Monthly Rank
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 max-lg:h-112 lg:min-h-75 lg:max-h-112.5">
        <CardContent className="p-4 space-y-6">
          {/* Section 1: My Goals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                My Performance Targets
              </span>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row 2xl:flex-col">
              {/* Daily Goals Card */}
              <div className="flex-1 p-3 bg-secondary/15 rounded-xl border border-border/30 space-y-2.5 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-tight truncate">
                      Daily Activities
                    </h4>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase mt-0.5 truncate">
                      Calls & Meetings Today
                    </p>
                  </div>
                  <span className="text-xs font-black text-foreground shrink-0 pl-2">
                    {dailyGoals.completed}/{dailyGoals.target}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Custom progress bar */}
                  <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-secondary/40">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-primary"
                      style={{ width: `${dailyGoals.percentage}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                    <span className="truncate">Target: 10 completions</span>
                    <span className="text-primary shrink-0">{dailyGoals.percentage}% Done</span>
                  </div>
                </div>
              </div>

              {/* Monthly Goals Card */}
              <div className="flex-1 p-3 bg-secondary/15 rounded-xl border border-border/30 space-y-2.5 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-tight truncate">
                      Monthly Conversions
                    </h4>
                    <p className="text-[9px] font-semibold text-muted-foreground uppercase mt-0.5 truncate">
                      Successes This Month
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-500 shrink-0 pl-2">
                    {monthlyGoals.completed}/{monthlyGoals.target}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Custom progress bar */}
                  <div className="relative w-full h-1.5 rounded-full overflow-hidden bg-emerald-500/10">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                      style={{ width: `${monthlyGoals.percentage}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                    <span className="truncate">Target: 5 conversions</span>
                    <span className="text-emerald-500 shrink-0">{monthlyGoals.percentage}% Done</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Team Leaderboard */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Team Monthly Leaderboard
              </span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.userId}
                  className={`flex flex-col justify-between gap-2.5 rounded-xl border p-2.5 transition-all duration-200 sm:gap-2 md:flex-row md:items-center 2xl:flex-col 2xl:items-stretch ${
                    index === 0
                      ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                      : "bg-secondary/10 border-border/20 hover:bg-secondary/20"
                  }`}
                >
                  <div className="flex min-w-0 w-full items-center gap-3 sm:w-auto">
                    {getRankBadge(index)}
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">
                          {player.name}
                        </span>
                        {index === 0 && (
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground truncate block">
                        {player.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pl-8 text-left shrink-0 md:pl-0 md:text-right 2xl:pl-8 2xl:text-left">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-black text-emerald-500">
                      {player.conversions} conversion{player.conversions > 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground/30 space-y-2 border border-dashed rounded-xl">
                  <Medal className="w-6 h-6 text-muted-foreground/20" />
                  <p className="text-[10px] font-black uppercase tracking-widest">
                    No Monthly Conversions Yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
    </div>
  );
}
