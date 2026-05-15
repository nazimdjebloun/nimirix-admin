"use client";

import {
  ChartLineData01Icon,
  Target01Icon,
  CodeIcon,
  Shield01Icon,
  CloudIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const stats = [
  {
    title: "Sales Revenue",
    value: "$128,430",
    change: "+12.5%",
    icon: Target01Icon,
    description: "Total value in pipeline",
    status: "positive",
  },
  {
    title: "Active Projects",
    value: "24",
    change: "3 in progress",
    icon: ChartLineData01Icon,
    description: "Current production load",
    status: "neutral",
  },
  {
    title: "Dev Velocity",
    value: "42 pts",
    change: "+5.2%",
    icon: CodeIcon,
    description: "Average sprint completion",
    status: "positive",
  },
  {
    title: "System Health",
    value: "99.98%",
    change: "Normal",
    icon: CloudIcon,
    description: "Uptime across all services",
    status: "positive",
  },
]

const teamStatus = [
  { name: "Sales Team", status: "High Activity", color: "text-green-500", progress: 85 },
  { name: "Product Team", status: "On Track", color: "text-blue-500", progress: 70 },
  { name: "Dev Team", status: "Sprint 42", color: "text-purple-500", progress: 65 },
  { name: "QA Team", status: "Testing Phase", color: "text-amber-500", progress: 40 },
  { name: "DevOps", status: "Optimization", color: "text-cyan-500", progress: 95 },
]

export function AdminOverview() {
  return (
    <div className="flex flex-col gap-6 p-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-muted-foreground">
          Real-time insights across all organizational departments.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none bg-muted/50 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <HugeiconsIcon icon={stat.icon} size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={stat.status === "positive" ? "default" : "secondary"}
                  className="text-[10px] h-4"
                >
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none bg-muted/20 shadow-none">
          <CardHeader>
            <CardTitle>Departmental Performance</CardTitle>
            <CardDescription>
              A breakdown of operational health and progress by team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {teamStatus.map((team) => (
                <div key={team.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{team.name}</span>
                    <span className={`text-xs font-bold ${team.color}`}>
                      {team.status}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${team.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none bg-muted/20 shadow-none">
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
            <CardDescription>
              Items requiring immediate attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <HugeiconsIcon icon={Shield01Icon} size={20} className="text-destructive mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-destructive">2 Blocking Bugs in QA</span>
                  <span className="text-xs text-destructive/80">Affecting the v2.4.0 release candidate.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <HugeiconsIcon icon={Target01Icon} size={20} className="text-amber-600 mt-1" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-amber-700">Contract Expiry: Nimirix Corp</span>
                  <span className="text-xs text-amber-700/80">Renewal due in 12 days.</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-700">Hiring: New Dev Role</span>
                  <span className="text-xs text-blue-700/80">14 new applications received today.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
