"use client"

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ClientCrmCard } from "@/components/sales/dashboard/client-crm-card"
import type { api } from "@/convex/_generated/api"

type Client =
  (typeof api.sales.pipeline.queries.getPipeline._returnType)["page"][0]

interface PipelineCrmSheetProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PipelineCrmSheet({
  client,
  open,
  onOpenChange,
}: PipelineCrmSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-100 overflow-y-auto sm:w-135">
        <SheetTitle className="px-6 pt-6 text-lg">
          {client?.companyName ?? "Client CRM"}
        </SheetTitle>
        <SheetDescription className="px-6 text-sm text-muted-foreground">
          Manage meetings, interactions, and view client details.
        </SheetDescription>
        <div className="px-6 pt-4 pb-6">
          {client && (
            <ClientCrmCard
              client={client as Parameters<typeof ClientCrmCard>[0]["client"]}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
