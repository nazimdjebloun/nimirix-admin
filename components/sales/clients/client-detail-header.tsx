"use client"

import { ChevronLeft, Building2, Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Doc } from "@/convex/_generated/dataModel"

interface ClientDetailHeaderProps {
  client: Doc<"clients">
  canManageProjects: boolean
  onAddProject: () => void
}

export function ClientDetailHeader({
  client,
  canManageProjects,
  onAddProject,
}: ClientDetailHeaderProps) {
  return (
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
            onClick={onAddProject}
            className="w-full gap-2 bg-primary text-xs font-black tracking-widest text-primary-foreground uppercase sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>
    </div>
  )
}
