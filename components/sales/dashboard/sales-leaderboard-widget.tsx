"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Target } from "lucide-react"
import { useMemo } from "react"
import { Spinner } from "@/components/ui/spinner"

interface SalesLeaderboardWidgetProps {
  currentTime?: number
}

export function SalesLeaderboardWidget({
  currentTime: propCurrentTime,
}: SalesLeaderboardWidgetProps) {
  const localCurrentTime = useMemo(() => new Date().getTime(), [])
  const currentTime = propCurrentTime ?? localCurrentTime

  const data = useQuery(api.sales.dashboard.queries.getLeaderboardAndGoals, {
    currentTime,
  })

  if (data === undefined) {
    return (
      <Card className="flex h-[380px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/40 p-6 shadow-xs backdrop-blur-md">
        <Spinner className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-4 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
          Loading leaderboard stats...
        </p>
      </Card>
    )
  }

  const { dailyGoals, monthlyGoals } = data

  return (
    <Card className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-0 shadow-xs backdrop-blur-md">
      <CardHeader className="shrink-0 border-b bg-accent/20 p-4 pb-2">
        <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex min-w-0 items-center gap-2 text-xs font-black tracking-widest text-muted-foreground uppercase">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="min-w-0 wrap-break-word">
              Performance & Team Leaderboard
            </span>
          </CardTitle>
          <Badge className="w-fit border-amber-500/20 bg-amber-500/15 text-[10px] font-black tracking-wider text-amber-600 uppercase">
            Monthly Rank
          </Badge>
        </div>
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="space-y-6 p-4">
          {/* Section 1: My Goals */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                My Performance Targets
              </span>
            </div>

            <div className="flex w-full min-w-0 flex-col gap-4 md:flex-row 2xl:flex-col">
              {/* Daily Goals Card */}
              <div className="min-w-0 flex-1 space-y-2.5 rounded-xl border border-border/30 bg-secondary/15 p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold tracking-tight text-foreground uppercase">
                      Daily Activities
                    </h4>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-muted-foreground uppercase">
                      Calls & Meetings Today
                    </p>
                  </div>
                  <span className="shrink-0 pl-2 text-xs font-black text-foreground">
                    {dailyGoals.completed}/{dailyGoals.target}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Custom progress bar */}
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/40">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${dailyGoals.percentage}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-[9px] font-black tracking-wider text-muted-foreground uppercase">
                    <span className="truncate">Target: 10 completions</span>
                    <span className="shrink-0 text-primary">
                      {dailyGoals.percentage}% Done
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Goals Card */}
              <div className="min-w-0 flex-1 space-y-2.5 rounded-xl border border-border/30 bg-secondary/15 p-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold tracking-tight text-foreground uppercase">
                      Monthly Conversions
                    </h4>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-muted-foreground uppercase">
                      Successes This Month
                    </p>
                  </div>
                  <span className="shrink-0 pl-2 text-xs font-black text-emerald-500">
                    {monthlyGoals.completed}/{monthlyGoals.target}
                  </span>
                </div>
                <div className="space-y-1">
                  {/* Custom progress bar */}
                  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/10">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${monthlyGoals.percentage}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap justify-between gap-2 text-[9px] font-black tracking-wider text-muted-foreground uppercase">
                    <span className="truncate">Target: 5 conversions</span>
                    <span className="shrink-0 text-emerald-500">
                      {monthlyGoals.percentage}% Done
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
