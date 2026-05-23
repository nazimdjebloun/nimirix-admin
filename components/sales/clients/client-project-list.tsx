"use client"

import { useState } from "react"
import { FolderKanban, Search, ArrowUpDown, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Doc } from "@/convex/_generated/dataModel"
import { ClientProjectCard } from "./client-project-card"

interface ClientProjectListProps {
  projects: Doc<"projects">[]
  canManage: boolean
  onEdit: (project: Doc<"projects">) => void
  onDelete: (project: Doc<"projects">) => void
}

export function ClientProjectList({
  projects,
  canManage,
  onEdit,
  onDelete,
}: ClientProjectListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false
    if (search.trim()) {
      const term = search.toLowerCase()
      return (
        project.name.toLowerCase().includes(term) ||
        project.scope.toLowerCase().includes(term) ||
        project.notes?.toLowerCase().includes(term)
      )
    }
    return true
  })

  const sortedProjects = [...filteredProjects].sort((a, b) =>
    sortOrder === "newest" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
            Provisioned Projects ({projects.length})
          </h2>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full flex justify-center items-center"
      >
        <TabsList className="flex flex-wrap gap-3 p-1 h-auto!">
          {[
            { value: "all", label: "All Projects" },
            { value: "pending", label: "Pending" },
            { value: "in_planning", label: "In Planning" },
            { value: "in_progress", label: "In Progress" },
            { value: "delivered", label: "Delivered" },
            { value: "cancelled", label: "Cancelled" },
            { value: "paused", label: "Paused" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="uppercase"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or scope..."
            className="rounded-xl border-border/70 bg-card py-5 pr-4 pl-9 focus-visible:ring-1"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            Sort:
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 gap-2 rounded-xl text-xs font-bold uppercase"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortOrder === "newest" ? "Newest First" : "Oldest First"}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={() => setSortOrder("newest")}
                className="text-xs font-bold uppercase"
              >
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortOrder("oldest")}
                className="text-xs font-bold uppercase"
              >
                Oldest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
            <FolderKanban className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/40" />
            <h3 className="text-sm font-black tracking-widest text-foreground uppercase">
              No Projects Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {projects.length === 0
                ? "No deliverables have been provisioned yet."
                : "No projects match your active search terms or status tab filter."}
            </p>
          </div>
        ) : (
          sortedProjects.map((project) => (
            <ClientProjectCard
              key={project._id}
              project={project}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
