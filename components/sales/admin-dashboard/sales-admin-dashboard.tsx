"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  ShieldCheck,
  Plus,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import StatCard from "@/components/sales/dashboard/stat-card"
import { AdminPipelineStage } from "@/components/sales/admin-dashboard/admin-pipeline-stage"
import { Button } from "@/components/ui/button"

// Admin Components
import { InteractionFeedCard } from "@/components/sales/admin-dashboard/InteractionFeedCard"
import { MeetingFeedCard } from "@/components/sales/admin-dashboard/MeetingFeedCard"
import { StatusChangeFeedCard } from "@/components/sales/admin-dashboard/StatusChangeFeedCard"
import { FinalStageFeedCard } from "@/components/sales/admin-dashboard/FinalStageFeedCard"
import { GhostedCard } from "@/components/sales/admin-dashboard/ghosted-leads-card"
import { StagnantCard } from "@/components/sales/admin-dashboard/stagnant-leads-card"
import { UnassignedCard } from "@/components/sales/admin-dashboard/unassigned-leads-card"
import { TeamPerformanceCard } from "@/components/sales/admin-dashboard/team-performance-card"
import { Spinner } from "@/components/ui/spinner"
import { AddProspectDialog } from "../pipeline/create-lead-dialog"

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

export function SalesAdminDashboard() {
  const [currentTime, setCurrentTime] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const data = useQuery(api.sales.admin.queries.getAdminDashboardData, {
    currentTime,
  })

  if (!data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="" />
      </div>
    )
  }

  const { pipeline, redFlags } = data

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1.5">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Admin Operations
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Owner View • Total control over sales performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold"
            asChild
          >
            <Link href="/sales/dashboard">My View</Link>
          </Button>
          <AddProspectDialog>
            <Button className="w-full px-6 py-4 text-sm font-semibold shadow-sm sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              New Lead
            </Button>
          </AddProspectDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pipeline"
          value={Object.values(pipeline)
            .reduce((a, b) => a + b, 0)
            .toString()}
          icon={<Target className="h-3.5 w-3.5" />}
          subtitle="All active leads"
        />
        <StatCard
          title="Total Conversions"
          value={pipeline.converted.toString()}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
          color="text-emerald-500"
          subtitleColor="text-emerald-500/80"
          subtitle="All-time converted clients"
        />
        <StatCard
          title="Active Deals"
          value={(
            pipeline.prospect +
            pipeline.initial_contact +
            pipeline.negotiation +
            pipeline.verbal_agreement
          ).toString()}
          icon={<Users className="h-3.5 w-3.5" />}
          color="text-indigo-500"
          subtitleColor="text-indigo-500/80"
          subtitle="Leads in progress"
        />
        <StatCard
          title="Action Needed"
          value={(
            redFlags.ghosted.length +
            redFlags.stagnant.length +
            redFlags.unassigned.length
          ).toString()}
          icon={<AlertCircle className="h-3.5 w-3.5" />}
          color="text-rose-500"
          subtitleColor="text-rose-500/80"
          subtitle="Alerts to resolve"
        />
      </div>

      {/* ─── GLOBAL PIPELINE (Full Width) ─────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeading title="Global Pipeline" accentClassName="bg-primary" />
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <AdminPipelineStage status="prospect" count={pipeline.prospect} />
          <AdminPipelineStage
            status="initial_contact"
            count={pipeline.initial_contact}
          />
          <AdminPipelineStage
            status="negotiation"
            count={pipeline.negotiation}
          />
          <AdminPipelineStage
            status="verbal_agreement"
            count={pipeline.verbal_agreement}
          />
        </div>
      </section>

      {/* ─── IMMEDIATE ACTION REQUIRED (Full Width Row) ─────────────────── */}
      <section className="space-y-4">
        <SectionHeading
          title="Immediate Action Required"
          accentClassName="bg-rose-500"
        />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <GhostedCard clients={redFlags.ghosted} />
          <StagnantCard clients={redFlags.stagnant} />
          <UnassignedCard clients={redFlags.unassigned} />
        </div>
      </section>

      {/* ─── TEAM PERFORMANCE (Full Width Scorecard) ────────────────────── */}
      <TeamPerformanceCard currentTime={currentTime} />

      {/* ─── LIVE FEEDS SECTION (Three Columns) ─────────────────────────── */}
      <section className="space-y-4 border-t border-border/50 pt-4">
        <SectionHeading
          title="Live Activity Feeds"
          accentClassName="bg-primary"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InteractionFeedCard />
          <MeetingFeedCard />
          <StatusChangeFeedCard />
          <FinalStageFeedCard />
        </div>
      </section>
    </div>
  )
}
