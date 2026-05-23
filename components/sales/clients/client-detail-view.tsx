"use client"

import { useState } from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useUser } from "@/context/user-context"
import {
  ChevronLeft,
  Building2,
  Mail,
  Calendar,
  Briefcase,
  Users,
  FolderKanban,
  Plus,
  Search,
  ChevronDown,
  Trash2,
  Edit2,
  Clock,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateProjectDialog } from "./create-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { formatDateShortMonth, formatDateTimeShortMonth } from "@/lib/utils/date-utils"
import { formatPhone } from "@/lib/utils/format-phone"
import { ROLE_LABELS } from "@/lib/auth/roles"
import {
  formatCurrency,
  getProjectStatusColor,
  getProjectTypeLabel,
  getPaymentMethodLabel,
  getPaymentMethodColor,
} from "./lib/helpers"
import { Spinner } from "@/components/ui/spinner"

interface ClientDetailViewProps {
  clientId: Id<"clients">
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const currentUser = useUser()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const { isAuthenticated } = useConvexAuth()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Doc<"projects"> | null>(
    null
  )
  const [deletingProject, setDeletingProject] =
    useState<Doc<"projects"> | null>(null)

  const data = useQuery(
    api.sales.clients.queries.getClientDetails,
    isAuthenticated && clientId ? { clientId } : "skip"
  )

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-primary" />
          <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
            Loading Client Context...
          </p>
        </div>
      </div>
    )
  }

  const { client, projects, collaborators } = data

  const isManagerOrAdmin =
    currentUser?.role === "admin" || currentUser?.role === "leadSales"
  const isPrimaryOwner = client.salesPersonId === currentUser?._id
  const canManageProjects = isManagerOrAdmin || isPrimaryOwner

  // Filter projects local state
  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) {
      return false
    }
    if (search.trim()) {
      const term = search.toLowerCase()
      const nameMatch = project.name.toLowerCase().includes(term)
      const scopeMatch = project.scope.toLowerCase().includes(term)
      const notesMatch = project.notes?.toLowerCase().includes(term)
      return nameMatch || scopeMatch || notesMatch
    }
    return true
  })

  // Sort projects local state
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOrder === "newest") {
      return b.createdAt - a.createdAt
    } else {
      return a.createdAt - b.createdAt
    }
  })

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 md:px-0">
      {/* Back button & Action Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/sales/clients"
          className="flex w-fit items-center gap-1.5 text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Converted Directory
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                {client.companyName}
              </h1>
              <Badge
                variant="outline"
                className="rounded-md border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-500 uppercase"
              >
                Converted Client
              </Badge>
            </div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Primary Contact: {client.contact}
            </p>
          </div>
          {canManageProjects && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="w-full gap-2 rounded-xl bg-primary py-5 text-xs font-black tracking-widest text-primary-foreground uppercase shadow-lg shadow-primary/20 hover:bg-primary/95 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Provision Project
            </Button>
          )}
        </div>
      </div>

      {/* Main Client Details Card */}
      <Card className="overflow-hidden rounded-2xl border bg-card/45 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Column 1: Communication */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Mail className="h-3.5 w-3.5 text-primary/70" />
                <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Contact Information
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <InfoRow label="Email" value={client.email} />
                {client.phone && (
                  <InfoRow label="Phone" value={formatPhone(client.phone)} />
                )}
                {client.address && (
                  <InfoRow label="Address" value={client.address} />
                )}
                <InfoRow
                  label="Contact Email"
                  value={client.contactEmail || "-"}
                />
                <InfoRow
                  label="Contact Phone"
                  value={
                    client.contactPhone ? formatPhone(client.contactPhone) : "-"
                  }
                />
              </div>
            </div>

            {/* Column 2: Administration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Briefcase className="h-3.5 w-3.5 text-primary/70" />
                <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Billing & Registry
                </h3>
              </div>
              <div className="space-y-2.5 text-xs">
                <InfoRow label="NIF Number" value={client.nif || "-"} />
                <InfoRow label="RC Number" value={client.rc || "-"} />
                <InfoRow label="Client Sector" value={client.activity || "-"} />
                <InfoRow
                  label="Converted At"
                  value={
                    client.signDate
                      ? formatDateTimeShortMonth(client.signDate)
                      : formatDateTimeShortMonth(client.updatedAt)
                  }
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Priority
                  </span>
                  <Badge className="rounded-sm px-1.5 py-0.25 text-[9px] font-black uppercase">
                    {client.priority}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Column 3: Collaboration & Sales Ownership */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Users className="h-3.5 w-3.5 text-primary/70" />
                <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                  Account Ownership
                </h3>
              </div>
              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="mb-1.5 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                    Primary Sales Person
                  </p>
                  {client.salesPerson ? (
                    <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-accent/60 p-2.5">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-foreground">
                          {client.salesPerson.name}
                        </span>
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                          {ROLE_LABELS[client.salesPerson.role] ||
                            client.salesPerson.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Unassigned
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[9px] font-black tracking-widest text-muted-foreground uppercase">
                    Shared Collaborators ({collaborators.length})
                  </p>
                  {collaborators.length === 0 ? (
                    <p className="pl-1 text-xs text-muted-foreground italic">
                      No team members assigned
                    </p>
                  ) : (
                    <div className="flex max-h-[80px] flex-wrap gap-1.5 overflow-y-auto">
                      {collaborators.map((collab) => (
                        <Badge
                          key={collab._id}
                          variant="secondary"
                          className="rounded-md px-2 py-0.5 text-[9px] font-bold"
                        >
                          {collab.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-2" />

      {/* Projects Title Area */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-black tracking-tight text-foreground uppercase">
            Provisioned Projects ({projects.length})
          </h2>
        </div>
      </div>

      {/* Dynamic Filtering Tabs */}
      <Tabs
        defaultValue="all"
        value={statusFilter}
        onValueChange={setStatusFilter}
        className="w-full"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border bg-accent/60 p-1 md:w-fit">
          <TabsTrigger
            value="all"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            All Projects
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="in_planning"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            In Planning
          </TabsTrigger>
          <TabsTrigger
            value="in_progress"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            In Progress
          </TabsTrigger>
          <TabsTrigger
            value="delivered"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Delivered
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Cancelled
          </TabsTrigger>
          <TabsTrigger
            value="paused"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Paused
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search & Sort Toolbar */}
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

      {/* Projects List Container */}
      <div className="flex flex-col gap-4">
        {sortedProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/20 p-12 text-center">
            <FolderKanban className="mb-3 h-10 w-10 animate-pulse text-muted-foreground/40" />
            <h3 className="text-sm font-black tracking-widest text-foreground uppercase">
              No Projects Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              {projects.length === 0
                ? "No deliverables have been provisioned yet. Click 'Provision Project' above to create the client's first project."
                : "No projects match your active search terms or status tab filter."}
            </p>
          </div>
        ) : (
          sortedProjects.map((project) => (
            <div
              key={project._id}
              className="flex flex-col justify-between gap-5 rounded-2xl border border-border/40 bg-card p-5 shadow-xs transition-colors hover:border-primary/40 md:flex-row md:items-stretch"
            >
              {/* Left Side: Metadata & Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <h4 className="text-sm font-black tracking-tight text-foreground uppercase">
                    {project.name}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-accent/80 px-2 py-0.25 text-[9px] font-black tracking-wider text-foreground uppercase"
                    >
                      {getProjectTypeLabel(project.projectType)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`rounded-md px-2 py-0.25 text-[9px] font-black tracking-wider uppercase ${getProjectStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                {/* Scope of Work Block */}
                {project.scope && (
                  <div className="rounded-xl border border-border/30 bg-accent/25 p-3 text-xs leading-relaxed text-muted-foreground">
                    <p className="mb-1 text-[9px] font-black tracking-widest text-foreground uppercase">
                      Scope of Deliverables
                    </p>
                    {project.scope}
                  </div>
                )}

                {/* Features Collapsible */}
                {(project.features ?? []).length > 0 && (
                  <Collapsible className="rounded-xl border border-primary/10 bg-primary/5">
                    <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-2 text-left text-[9px] font-black tracking-widest text-primary/80 uppercase">
                      <span>Project Features ({project.features.length})</span>
                      <ChevronRight className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <ul className="space-y-1 px-3 pb-3">
                        {(project.features ?? []).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Notes Block */}
                {project.notes && (
                  <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs leading-relaxed text-muted-foreground">
                    <p className="mb-1 text-[9px] font-black tracking-widest text-amber-600 uppercase dark:text-amber-500">
                      Internal Hand-off Notes
                    </p>
                    {project.notes}
                  </div>
                )}

                {/* Timeline — Emphasized Due Date + Created */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {/* Estimated Client Due Date */}
                  <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black tracking-widest text-primary/70 uppercase">
                        Est. Client Due Date
                      </span>
                      <span className="text-xs font-black text-foreground">
                        {formatDateShortMonth(project.estimatedTimeline)}
                      </span>
                    </div>
                  </div>
                  {/* Created At */}
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    <Clock className="h-3.5 w-3.5 text-primary/75" />
                    Created:{" "}
                    <strong className="text-foreground">
                      {formatDateTimeShortMonth(project.createdAt)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Right Side: Pricing & Actions */}
              <div className="flex shrink-0 flex-row justify-between gap-4 border-t border-border/30 pt-4 md:flex-col md:items-end md:justify-center md:border-t-0 md:border-l md:pt-0 md:pl-5">
                <div className="space-y-2 md:text-right">
                  <p className="text-[9px] leading-none font-black tracking-widest text-muted-foreground uppercase">
                    Value / Budget
                  </p>
                  <p className="text-lg font-black text-foreground">
                    {formatCurrency(project.price, "DZD")}
                  </p>
                  {/* Payment Method Badge — Bigger with color */}
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2.5 py-1 text-[10px] font-black tracking-wider uppercase ${getPaymentMethodColor(
                      project.paymentMethod
                    )}`}
                  >
                    {getPaymentMethodLabel(project.paymentMethod)}
                  </Badge>
                </div>

                {/* Edit & Delete Actions */}
                {canManageProjects && (
                  <div className="flex items-center gap-1.5 md:mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg border border-border/20 text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg border border-border/20 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeletingProject(project)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog Containers */}
      {isCreateOpen && (
        <CreateProjectDialog
          clientId={clientId}
          companyName={client.companyName}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      )}

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          companyName={client.companyName}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          projectId={deletingProject._id}
          projectName={deletingProject.name}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/10 py-0.5 last:border-0">
      <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="max-w-[180px] truncate text-right font-extrabold text-foreground">
        {value}
      </span>
    </div>
  )
}
