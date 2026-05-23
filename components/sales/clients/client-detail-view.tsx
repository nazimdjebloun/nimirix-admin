"use client"

import { useState, useEffect } from "react"
import { useQuery, useConvexAuth } from "convex/react"
import { useRouter } from "next/navigation"
import { api } from "@/convex/_generated/api"
import { Doc, Id } from "@/convex/_generated/dataModel"
import { useUser } from "@/context/user-context"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { CreateProjectDialog } from "./create-project-dialog"
import { EditProjectDialog } from "./edit-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { ClientDetailHeader } from "./client-detail-header"
import { ClientInfoCard } from "./client-info-card"
import { ClientProjectList } from "./client-project-list"

interface ClientDetailViewProps {
  clientId: Id<"clients">
}

export function ClientDetailView({ clientId }: ClientDetailViewProps) {
  const router = useRouter()
  const currentUser = useUser()
  const { isAuthenticated } = useConvexAuth()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Doc<"projects"> | null>(null)
  const [deletingProject, setDeletingProject] = useState<Doc<"projects"> | null>(null)

  const data = useQuery(
    api.sales.clients.queries.getClientDetails,
    isAuthenticated && clientId ? { clientId } : "skip"
  )

  useEffect(() => {
    if (data === null) {
      router.replace("/sales/clients")
    }
  }, [data, router])

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="" />
      </div>
    )
  }

  const { client, projects, collaborators } = data

  const isManagerOrAdmin =
    currentUser?.role === "admin" || currentUser?.role === "leadSales"
  const isPrimaryOwner = client.salesPersonId === currentUser?._id
  const canManageProjects = isManagerOrAdmin || isPrimaryOwner

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 md:px-0">
      <ClientDetailHeader
        client={client}
        canManageProjects={canManageProjects}
        onAddProject={() => setIsCreateOpen(true)}
      />

      <ClientInfoCard client={client} collaborators={collaborators} />

      <Separator className="my-2" />

      <ClientProjectList
        projects={projects}
        canManage={canManageProjects}
        onEdit={setEditingProject}
        onDelete={setDeletingProject}
      />

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
