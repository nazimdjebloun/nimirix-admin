"use client"

import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  Phone,
  CheckCircle,
  Award,
  XCircle,
  Plus,
  type LucideIcon,
} from "lucide-react"
import { useMemo } from "react"
import StatCard from "@/components/sales/dashboard/stat-card"
import { PipelineStage } from "@/components/sales/dashboard/pipeline-stage"
import { MeetingsScheduleCard } from "@/components/sales/dashboard/meetings-schedule-card"
import { InteractionsScheduleCard } from "@/components/sales/dashboard/interactions-schedule-card"
import { TodayActionCenter } from "@/components/sales/dashboard/today-action-center"
import { CrmHygieneAlerts } from "@/components/sales/dashboard/crm-hygiene-alerts"
import { SalesLeaderboardWidget } from "@/components/sales/dashboard/sales-leaderboard-widget"
import { useUser } from "@/context/user-context"
import { Spinner } from "@/components/ui/spinner"
import { AddProspectDialog } from "@/components/sales/pipeline/create-lead-dialog"
import { Button } from "@/components/ui/button"

type StatsCardConfig = {
  title: string
  valueKey:
    | "totalActive"
    | "conversionsThisMonth"
    | "lostThisMonth"
    | "allTimeConversions"
    | "allTimeLost"
  icon: LucideIcon
  subtitle: string
  valuePrefix?: string
  color?: string
  subtitleColor?: string
  source?: "stats"
}

type PipelineCardConfig = {
  title: string
  valueKey: "prospect" | "initial_contact" | "negotiation" | "verbal_agreement"
  icon: LucideIcon
  subtitle: string
  valuePrefix?: string
  color?: string
  subtitleColor?: string
  source: "pipeline"
}

type OverviewCardConfig = StatsCardConfig | PipelineCardConfig

const overviewCards: OverviewCardConfig[] = [
  // {
  //   title: "Active Leads",
  //   valueKey: "totalActive" as const,
  //   icon: Users,
  //   subtitle: "Current clients",
  // },
  {
    title: "Conversions (30d)",
    valueKey: "conversionsThisMonth" as const,
    icon: TrendingUp,
    subtitle: "Successes this month",
    valuePrefix: "+",
    color: "text-emerald-500",
    subtitleColor: "text-emerald-500/80",
  },
  {
    title: "Lost (30d)",
    valueKey: "lostThisMonth" as const,
    icon: TrendingDown,
    subtitle: "Lost this month",
    valuePrefix: "-",
    color: "text-rose-500",
    subtitleColor: "text-rose-500/80",
  },
  {
    title: "New Prospects",
    valueKey: "prospect" as const,
    icon: Users,
    subtitle: "New leads",
    source: "pipeline" as const,
  },
  {
    title: "Initial Contact",
    valueKey: "initial_contact" as const,
    icon: Phone,
    subtitle: "To qualify",
    source: "pipeline" as const,
  },
  {
    title: "In Negotiation",
    valueKey: "negotiation" as const,
    icon: AlertCircle,
    subtitle: "Ongoing discussions",
    color: "text-amber-500",
    source: "pipeline" as const,
  },
  {
    title: "Verbal Agreement",
    valueKey: "verbal_agreement" as const,
    icon: CheckCircle,
    subtitle: "Pending signature",
    color: "text-teal-500",
    subtitleColor: "text-teal-500/80",
    source: "pipeline" as const,
  },
  {
    title: "Total Converted",
    valueKey: "allTimeConversions" as const,
    icon: Award,
    subtitle: "Success history",
    color: "text-emerald-600 dark:text-emerald-400",
    subtitleColor: "text-emerald-600/80 dark:text-emerald-400/80",
  },
  {
    title: "Total Lost",
    valueKey: "allTimeLost" as const,
    icon: XCircle,
    subtitle: "Loss history",
    color: "text-rose-600 dark:text-rose-400",
    subtitleColor: "text-rose-600/80 dark:text-rose-400/80",
  },
]

function SectionHeading({
  title,
  accentClassName,
}: {
  title: string
  accentClassName: string
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={`h-4 w-1 rounded-full ${accentClassName}`} />
      <h2 className="text-sm font-black tracking-[0.2em] text-foreground uppercase">
        {title}
      </h2>
    </div>
  )
}

export function SalesDashboard() {
  const user = useUser()
  const { isAuthenticated } = useConvexAuth()

  const isReady = !!user && isAuthenticated
  const { currentTime, startOfDay, endOfDay } = useMemo(() => {
    const now = new Date().getTime()
    const start = new Date().setHours(0, 0, 0, 0)
    const end = new Date().setHours(23, 59, 59, 999)
    return { currentTime: now, startOfDay: start, endOfDay: end }
  }, [])

  const stats = useQuery(
    api.sales.dashboard.queries.getDashboardStats,
    isReady ? { currentTime } : "skip"
  )

  const todayActions = useQuery(
    api.sales.actionCenter.queries.getActionCenterToday,
    isReady ? { startOfDay, endOfDay } : "skip"
  )

  const upcomingReminders = useQuery(
    api.sales.actionCenter.queries.getUpcomingReminders,
    isReady ? { endOfDay } : "skip"
  )

  const hygiene = useQuery(
    api.sales.actionCenter.queries.getDashboardHygiene,
    isReady ? { currentTime } : "skip"
  )

  const isLoading = !stats || !todayActions || !upcomingReminders || !hygiene

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="" />
      </div>
    )
  }

  const pipelineStages = [
    { status: "prospect" as const, count: stats.pipeline.prospect },
    {
      status: "initial_contact" as const,
      count: stats.pipeline.initial_contact,
    },
    { status: "negotiation" as const, count: stats.pipeline.negotiation },
    {
      status: "verbal_agreement" as const,
      count: stats.pipeline.verbal_agreement,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Sales Dashboard
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Track leads, manage priorities, and monitor performance.
          </p>
        </div>
        <AddProspectDialog>
          <Button className="w-full px-6 py-4 text-sm font-semibold shadow-sm sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            New Lead
          </Button>
        </AddProspectDialog>
      </div>

      <section className="flex flex-col gap-5 md:flex-row">
        <div className="flex-1 space-y-4">
          <SectionHeading
            title="Today's Priorities"
            accentClassName="bg-amber-500"
          />
          <TodayActionCenter
            today={todayActions}
            upcoming={upcomingReminders}
            hygiene={hygiene}
            currentTime={currentTime}
          />
        </div>

        <div className="flex-1 space-y-4">
          <SectionHeading title="CRM Hygiene" accentClassName="bg-rose-500" />
          <CrmHygieneAlerts currentTime={currentTime} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="General Overview" accentClassName="bg-primary" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon
            const rawValue =
              card.source === "pipeline"
                ? stats.pipeline[card.valueKey]
                : stats.stats[card.valueKey]
            const value = `${card.valuePrefix ?? ""}${rawValue}`

            return (
              <StatCard
                key={card.title}
                title={card.title}
                value={value}
                icon={<Icon className="h-3.5 w-3.5" />}
                subtitle={card.subtitle}
                color={card.color}
                subtitleColor={card.subtitleColor}
              />
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="Sales Pipeline" accentClassName="bg-primary" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {pipelineStages.map((stage) => (
            <PipelineStage
              key={stage.status}
              status={stage.status}
              count={stage.count}
            />
          ))}
        </div>
      </section>
      <section className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 2xl:grid-cols-3">
        <div className="flex max-h-150 min-w-0 flex-col space-y-4">
          <SectionHeading
            title="Meetings Schedules"
            accentClassName="bg-violet-500"
          />
          <MeetingsScheduleCard />
        </div>
        <div className="flex max-h-150 min-w-0 flex-col space-y-4">
          <SectionHeading
            title="Interaction Schedules"
            accentClassName="bg-blue-500"
          />
          <InteractionsScheduleCard />
        </div>
        <div className="flex max-h-150 min-w-0 flex-col space-y-4 lg:col-span-2 2xl:col-span-1">
          <SectionHeading
            title="Performance & Leaderboard"
            accentClassName="bg-amber-500"
          />
          <SalesLeaderboardWidget currentTime={currentTime} />
        </div>
      </section>
    </div>
  )
}
