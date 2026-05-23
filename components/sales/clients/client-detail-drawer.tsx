"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetContent,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Plus,
  Loader2,
  Trash2,
  FolderKanban,
  Users,
} from "lucide-react"
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils"
import { formatPhone } from "@/lib/utils/format-phone"
import { useUser } from "@/context/user-context"
import { toast } from "sonner"
import { CreateProjectDialog } from "./create-project-dialog"
import { UserSelect } from "@/components/shared/user-select"
import {
  formatCurrency,
  getProjectStatusColor,
  getProjectTypeLabel,
  getPaymentMethodLabel,
} from "./lib/helpers"

interface ClientDetailDrawerProps {
  clientId: Id<"clients"> | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailDrawer({
  clientId,
  open,
  onOpenChange,
}: ClientDetailDrawerProps) {
  const currentUser = useUser()
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false)
  const [newCollaboratorId, setNewCollaboratorId] = useState("")

  const data = useQuery(
    api.sales.clients.queries.getClientDetails,
    clientId ? { clientId } : "skip"
  )

  const addCollaborator = useMutation(
    api.sales.clients.mutations.addCollaborator
  )
  const removeCollaborator = useMutation(
    api.sales.clients.mutations.removeCollaborator
  )

  const client = data?.client
  const projects = data?.projects || []
  const collaborators = data?.collaborators || []

  const isManagerOrAdmin =
    currentUser?.role === "admin" || currentUser?.role === "leadSales"
  const isPrimaryOwner = client?.salesPersonId === currentUser?._id
  const canManageCollaborators = isManagerOrAdmin || isPrimaryOwner

  const handleAddCollaborator = async (userId: string) => {
    if (!clientId || !userId) return
    try {
      await addCollaborator({ clientId, userId })
      toast.success("Collaborator added successfully")
      setNewCollaboratorId("")
    } catch (error) {
      console.error(error)
      const msg =
        error instanceof Error ? error.message : "Failed to add collaborator"
      toast.error(msg)
    }
  }

  const handleRemoveCollaborator = async (userId: string) => {
    if (!clientId) return
    try {
      await removeCollaborator({ clientId, userId })
      toast.success("Collaborator removed")
    } catch (error) {
      console.error(error)
      const msg =
        error instanceof Error ? error.message : "Failed to remove collaborator"
      toast.error(msg)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-2xl!"
        >
          <SheetTitle className="sr-only">Client Details Drawer</SheetTitle>

          {!data ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary/30" />
            </div>
          ) : !client ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Client not found
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="shrink-0 border-b bg-secondary/5 p-5 pb-4">
                <div className="flex items-start justify-between pr-8">
                  <div className="space-y-1">
                    <SheetTitle className="flex items-center gap-2 text-lg font-black">
                      <Building2 className="h-4 w-4 text-primary" />
                      {client.companyName}
                    </SheetTitle>
                    <SheetDescription className="flex items-center gap-1.5 text-xs font-semibold">
                      <User className="h-3 w-3" />
                      {client.contact}
                    </SheetDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-md border-emerald-500/20 bg-emerald-500/10 text-[9px] font-black tracking-wider text-emerald-500 uppercase"
                  >
                    Converted
                  </Badge>
                </div>
                {client.salesPerson && (
                  <p className="mt-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    Account Owner:{" "}
                    <span className="font-black text-foreground">
                      {client.salesPerson.name}
                    </span>
                  </p>
                )}
              </SheetHeader>

              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-6 p-5">
                  {/* Info Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-primary/60" />
                      <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                        Company Details
                      </h3>
                    </div>
                    <div className="grid gap-2 rounded-lg border border-border/30 bg-secondary/5 p-3 text-xs">
                      <InfoRow
                        icon={<Mail className="h-3 w-3" />}
                        label="Email"
                        value={client.email}
                      />
                      {client.phone && (
                        <InfoRow
                          icon={<Phone className="h-3 w-3" />}
                          label="Phone"
                          value={formatPhone(client.phone)}
                        />
                      )}
                      {client.address && (
                        <InfoRow
                          icon={<MapPin className="h-3 w-3" />}
                          label="Address"
                          value={client.address}
                        />
                      )}
                      {client.activity && (
                        <InfoRow
                          icon={<Briefcase className="h-3 w-3" />}
                          label="Activity"
                          value={client.activity}
                        />
                      )}
                      {client.nif && (
                        <InfoRow
                          icon={<Briefcase className="h-3 w-3" />}
                          label="NIF"
                          value={client.nif}
                        />
                      )}
                      {client.rc && (
                        <InfoRow
                          icon={<Briefcase className="h-3 w-3" />}
                          label="RC"
                          value={client.rc}
                        />
                      )}
                      <InfoRow
                        icon={<Calendar className="h-3 w-3" />}
                        label="Converted Date"
                        value={
                          client.signDate
                            ? formatDateTimeShortMonth(client.signDate)
                            : formatDateTimeShortMonth(client.updatedAt)
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Collaborators Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-primary/60" />
                        <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          Shared Collaborators
                        </h3>
                      </div>
                    </div>

                    {canManageCollaborators && (
                      <div className="flex w-full max-w-sm items-center gap-2">
                        <UserSelect
                          value={newCollaboratorId}
                          onValueChange={(val) => {
                            setNewCollaboratorId(val)
                            if (val) handleAddCollaborator(val)
                          }}
                          roles={["sales"]}
                          placeholder="Select sales rep to add..."
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {collaborators.length === 0 ? (
                        <p className="pl-1 text-xs text-muted-foreground italic">
                          No collaborators assigned.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {collaborators.map((collab) => (
                            <div
                              key={collab._id}
                              className="flex items-center justify-between rounded-md border border-border/30 bg-secondary/15 p-2"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-bold">
                                  {collab.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {collab.email}
                                </span>
                              </div>
                              {canManageCollaborators && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() =>
                                    handleRemoveCollaborator(collab._id)
                                  }
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Projects Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-3.5 w-3.5 text-primary/60" />
                        <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                          Provisioned Projects
                        </h3>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 bg-primary text-[10px] font-black tracking-widest text-primary-foreground uppercase"
                        onClick={() => setIsProjectFormOpen(true)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Project
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-muted-foreground">
                          <FolderKanban className="mb-2 h-8 w-8 opacity-50" />
                          <p className="text-xs font-black tracking-widest uppercase">
                            No projects provisioned
                          </p>
                          <p className="mt-1 text-center text-[10px]">
                            Click &quot;Add Project&quot; to set up deliverables
                            and timeline.
                          </p>
                        </div>
                      ) : (
                        projects.map((project) => (
                          <div
                            key={project._id}
                            className="space-y-3 rounded-lg border border-border bg-card p-3.5 shadow-xs transition-colors hover:border-primary/45"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-black tracking-tight text-foreground uppercase">
                                  {project.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="mt-1 rounded-sm px-1 text-[9px] font-bold uppercase"
                                >
                                  {getProjectTypeLabel(project.projectType)}
                                </Badge>
                              </div>
                              <Badge
                                variant="outline"
                                className={`rounded-sm px-2 text-[9px] font-bold uppercase ${getProjectStatusColor(
                                  project.status
                                )}`}
                              >
                                {project.status.replace(/_/g, " ")}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-b border-border/20 py-2 text-[10px]">
                              <div>
                                <p className="font-black tracking-wider text-muted-foreground uppercase">
                                  Value / Price
                                </p>
                                <p className="mt-0.5 text-xs font-bold text-foreground">
                                  {formatCurrency(project.price)}
                                </p>
                              </div>
                              <div>
                                <p className="font-black tracking-wider text-muted-foreground uppercase">
                                  Payment Method
                                </p>
                                <p className="mt-0.5 text-xs font-bold text-foreground">
                                  {getPaymentMethodLabel(project.paymentMethod)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Target
                                Completion:{" "}
                                <strong className="text-foreground">
                                  {formatDateTimeShortMonth(
                                    project.estimatedTimeline
                                  )}
                                </strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Created:{" "}
                                <strong>
                                  {formatDateTimeShortMonth(project.createdAt)}
                                </strong>
                              </span>
                            </div>

                            {project.scope && (
                              <div className="rounded border border-border/20 bg-secondary/15 p-2 text-[10px]">
                                <p className="mb-1 font-black tracking-wider text-foreground uppercase">
                                  Scope of Work
                                </p>
                                <p className="leading-relaxed text-muted-foreground">
                                  {project.scope}
                                </p>
                              </div>
                            )}

                            {project.notes && (
                              <div className="rounded border border-amber-500/10 bg-amber-500/5 p-2 text-[10px]">
                                <p className="mb-1 font-black tracking-wider text-amber-600 uppercase dark:text-amber-500">
                                  Internal Notes
                                </p>
                                <p className="leading-relaxed text-muted-foreground">
                                  {project.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {client && (
        <CreateProjectDialog
          clientId={client._id}
          companyName={client.companyName}
          open={isProjectFormOpen}
          onOpenChange={setIsProjectFormOpen}
        />
      )}
    </>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="text-muted-foreground/60">{icon}</span>
      <span className="w-24 shrink-0 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="truncate font-medium text-foreground">{value}</span>
    </div>
  )
}
