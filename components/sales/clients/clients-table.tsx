"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Building2,
  Calendar,
  Eye,
  Mail,
  Phone,
  UserCog,
} from "lucide-react"
import { ROLE_LABELS } from "@/lib/auth/roles"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils"
import { formatPhone } from "@/lib/utils/format-phone"
import { useUser } from "@/context/user-context"
import AssignSalesDialog from "./assign-sales-dialog"
import ClaimLeadDialog from "./claim-lead-dialog"
import { ClientsBulkActions } from "./clients-bulk-actions"
import Link from "next/link"

interface ClientsTableProps {
  clients: (typeof api.sales.clients.queries.getConvertedClientsPaginated._returnType)["page"]
  isLoading: boolean
  itemsPerPage: number
}

const COL_CLASSES = "flex items-center px-4 py-2.5"

const COLS = {
  checkbox: "flex-1 min-w-10 max-w-10 shrink-0",
  company: "flex-1 min-w-56",
  contact: "flex-1 min-w-36",
  activity: "flex-1 min-w-24",
  converted: "flex-1 min-w-28",
  sales: "flex-1 min-w-36",
  action: "flex-1 min-w-32 justify-center gap-1 flex-col",
}

export function ClientsTable({
  clients,
  isLoading,
  itemsPerPage,
}: ClientsTableProps) {
  const [selectedClientId, setSelectedClientId] =
    useState<Id<"clients"> | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<Id<"clients">>>(new Set())
  const user = useUser()

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === clients.length
        ? new Set()
        : new Set(clients.map((c) => c._id))
    )
  }

  const toggleSelect = (id: Id<"clients">) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border">
      <ScrollArea type="always" className="w-full">
        {/* Header */}
        <div className="flex min-w-max border-b bg-accent">
          <div className={cn(COL_CLASSES, COLS.checkbox)}>
            <Checkbox
              checked={
                selectedIds.size === clients.length && clients.length > 0
              }
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
            />
          </div>
          {(
            [
              "Company",
              "Contact",
              "Activity",
              "Converted",
              "Account Owner",
              "Action",
            ] as const
          ).map((label, i) => (
            <div
              key={label}
              className={cn(
                COL_CLASSES,
                "text-xs font-bold tracking-wider whitespace-nowrap text-muted-foreground uppercase",
                [
                  COLS.company,
                  COLS.contact,
                  COLS.activity,
                  COLS.converted,
                  COLS.sales,
                  COLS.action,
                ][i]
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="min-w-max">
          {isLoading ? (
            [...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="flex items-center border-b last:border-0">
                <div className={cn(COL_CLASSES, COLS.checkbox)}>
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className={cn(COL_CLASSES, COLS.company)}>
                  <div className="flex flex-col gap-1.5 py-0.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className={cn(COL_CLASSES, COLS.contact)}>
                  <div className="flex flex-col gap-1.5 py-0.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className={cn(COL_CLASSES, COLS.activity)}>
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <div className={cn(COL_CLASSES, COLS.converted)}>
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
                <div className={cn(COL_CLASSES, COLS.sales)}>
                  <Skeleton className="h-5 w-28 rounded-md" />
                </div>
                <div className={cn(COL_CLASSES, COLS.action)}>
                  <Skeleton className="h-7 w-20 rounded-lg" />
                </div>
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Building2 className="h-10 w-10 text-muted-foreground" />
                <h3 className="text-lg font-bold">
                  No converted clients found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Clients appear here once marked as converted in the pipeline.
                </p>
              </div>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className={cn(
                  "flex items-center border-b transition-colors last:border-0",
                  selectedIds.has(client._id) && "bg-accent/50"
                )}
              >
                <div className={cn(COL_CLASSES, COLS.checkbox)}>
                  <Checkbox
                    checked={selectedIds.has(client._id)}
                    onCheckedChange={() => toggleSelect(client._id)}
                    aria-label={`Select ${client.companyName}`}
                  />
                </div>

                {/* Company */}
                <div className={cn(COL_CLASSES, COLS.company, "min-w-0")}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold truncate">
                      {client.companyName}
                    </span>
                    {client.email ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <Mail className="h-2.5 w-2.5 shrink-0" /> {client.email}
                      </span>
                    ) : null}
                    {client.phone ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <Phone className="h-2.5 w-2.5 shrink-0" /> {formatPhone(client.phone)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Contact */}
                <div className={cn(COL_CLASSES, COLS.contact, "min-w-0")}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xs font-medium truncate">
                      {client.contact}
                    </span>
                    {client.contactEmail ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <Mail className="h-2.5 w-2.5 shrink-0" /> {client.contactEmail}
                      </span>
                    ) : null}
                    {client.contactPhone ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                        <Phone className="h-2.5 w-2.5 shrink-0" /> {formatPhone(client.contactPhone)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Activity */}
                <div className={cn(COL_CLASSES, COLS.activity)}>
                  <Badge
                    variant={client.activity ? "outline" : "secondary"}
                    className="rounded-md px-1.5 py-0 text-[10px] font-medium capitalize leading-5"
                  >
                    {client.activity ?? "None"}
                  </Badge>
                </div>

                {/* Converted Date */}
                <div className={cn(COL_CLASSES, COLS.converted)}>
                  <div
                    className="flex items-center gap-1 text-xs font-medium whitespace-nowrap"
                    suppressHydrationWarning
                  >
                    <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                    {formatDateTimeShortMonth(
                      client.signDate || client.updatedAt
                    )}
                  </div>
                </div>

                {/* Account Owner / Sales Person */}
                <div className={cn(COL_CLASSES, COLS.sales)}>
                  {(() => {
                    const sp = client.salesPerson as {
                      _id: string; name: string; email: string; role: string
                    } | null
                    return sp ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-semibold whitespace-nowrap">
                          {sp.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 py-0 text-[8px] font-semibold uppercase leading-4"
                        >
                          {ROLE_LABELS[sp.role] || sp.role.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        {(user?.role === "admin" || user?.role === "leadSales") && (
                          <AssignSalesDialog companyName={client.companyName} clientId={client._id} />
                        )}
                        {(user?.role === "admin" || user?.role === "leadSales" || user?.role === "sales") && (
                          <ClaimLeadDialog companyName={client.companyName} clientId={client._id} />
                        )}
                        {!user?.role && (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Actions */}
                <div className={cn(COL_CLASSES, COLS.action)}>
                  <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg text-[11px] font-bold" asChild>
                    <Link href={`/sales/clients/${client._id}`}>
                      <Eye className="h-3 w-3" />
                      Details
                    </Link>
                  </Button>
                  {client.salesPersonId && (user?.role === "admin" || user?.role === "leadSales") && (
                    <AssignSalesDialog
                      companyName={client.companyName}
                      clientId={client._id}
                      initialUserId={client.salesPersonId}
                      trigger={
                        <Button variant="outline" size="sm" className="h-7 gap-1 rounded-lg text-[11px] font-bold text-orange-600 border-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-950">
                          <UserCog className="h-3 w-3" />
                          Reassign
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <ClientsBulkActions
        selectedIds={selectedIds}
        clients={clients}
        onClear={() => setSelectedIds(new Set())}
        onBatchUpdateSuccess={() => setSelectedIds(new Set())}
        userRole={user?.role}
      />
    </div>
  )
}
