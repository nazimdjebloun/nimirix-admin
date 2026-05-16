
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPipelineStatusColor, getPipelinePriorityColor } from "@/components/sales/lib/helpers";
import { Building2, MoreVertical, Mail, Phone } from "lucide-react";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { api } from "@/convex/_generated/api";
import { PipelineClientDetailsDialog } from "./pipeline-client-details-dialog";
import { EditProspectDialog } from "./edit-prospect-dialog";
import { DeleteProspectDialog } from "./delete-prospect-dialog";
import { PipelineBulkActions } from "./pipeline-bulk-actions";
import { useUser } from "@/context/user-context";
import AssignSalesDialog from "./assign-sales-dialog";
import ClaimLeadDialog from "./claim-lead-dialog";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils";
import { formatPhone } from "@/lib/utils/format-phone";

interface PipelineTableProps {
  clients: typeof api.sales.pipeline.queries.getPipeline._returnType["page"];
  isLoading: boolean;
  itemsPerPage: number;
}

const COL_CLASSES = "flex items-center px-3 py-3";

const COLS = {
  checkbox: "w-10 shrink-0",
  company:  "flex-1 min-w-40",
  contact:  "flex-1 min-w-40",
  activity: "w-36 shrink-0",
  created:   "w-36 shrink-0",
  status:   "w-36 shrink-0",
  priority: "w-36 shrink-0",
  sales:    "w-40 shrink-0",
  action:   "w-16 shrink-0 justify-center",
};

export function PipelineTable({ clients, isLoading, itemsPerPage }: PipelineTableProps) {
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [clientToEdit, setClientToEdit] = useState<typeof clients[0] | null>(null);
  const [clientToDelete, setClientToDelete] = useState<typeof clients[0] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<Id<"clients">>>(new Set());
  const user = useUser();

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === clients.length
        ? new Set()
        : new Set(clients.map((c) => c._id))
    );
  };

  const toggleSelect = (id: Id<"clients">) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <div className="border overflow-hidden rounded-2xl w-full min-w-0">
      <ScrollArea type="always" className="w-full">
        {/* Header */}
        <div className="flex bg-accent border-b min-w-max">
          <div className={cn(COL_CLASSES, COLS.checkbox)}>
            <Checkbox
              checked={selectedIds.size === clients.length && clients.length > 0}
          //    disabled={Boolean(isLoading || clients.length === 0)}
              onCheckedChange={toggleSelectAll}
              aria-label="Select all"
            />
          </div>
          {(["Company", "Contact", "Activity", "Created", "Status", "Priority", "Sales Person", "Action"] as const).map(
            (label, i) => (
              <div
                key={label}
                className={cn(
                  COL_CLASSES,
                  "font-bold uppercase tracking-wider text-xs text-muted-foreground whitespace-nowrap",
                  [COLS.company, COLS.contact, COLS.activity, COLS.created, COLS.status, COLS.priority, COLS.sales, COLS.action][i]
                )}
              >
                {label}
              </div>
            )
          )}
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
                  <div className="flex flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className={cn(COL_CLASSES, COLS.contact)}>
                  <div className="flex flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <div className={cn(COL_CLASSES, COLS.activity)}>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className={cn(COL_CLASSES, COLS.created)}>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className={cn(COL_CLASSES, COLS.status)}>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <div className={cn(COL_CLASSES, COLS.priority)}>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className={cn(COL_CLASSES, COLS.sales)}>
                  <div className="flex flex-col gap-2 py-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className={cn(COL_CLASSES, COLS.action)}>
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))
          ) : clients.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-2">
                <Building2 className="w-10 h-10 text-muted-foreground" />
                <h3 className="font-bold text-lg">No leads found</h3>
                <p className="text-sm text-muted-foreground">
                  Adjust your filters or add a new prospect to get started.
                </p>
              </div>
            </div>
          ) : (
            clients.map((client) => (
              <div
                key={client._id}
                className={cn(
                  "flex items-center border-b last:border-0 transition-colors",
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
                <div className={cn(COL_CLASSES, COLS.company, "whitespace-nowrap")}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-[12px]">{client.companyName}</span>
                    {client.email ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-2.5 h-2.5" /> {client.email}
                      </span>
                    ) : "-"}
                    {client.phone ? (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="w-2.5 h-2.5" /> {formatPhone(client.phone)}
                      </span>
                    ) : "-"}
                  </div>
                </div>

                {/* Contact */}
                <div className={cn(COL_CLASSES, COLS.contact, "whitespace-nowrap")}>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium">{client.contact}</span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-2.5 h-2.5" /> {client.contactEmail || "-"}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="w-2.5 h-2.5" /> {client.contactPhone ? formatPhone(client.contactPhone) : "-"}
                    </span>
                  </div>
                </div>

                {/* Activity */}
                <div className={cn(COL_CLASSES, COLS.activity, "whitespace-nowrap")}>
                  <Badge
                    variant={client.activity ? "outline" : "secondary"}
                    className="rounded-md px-2 font-medium text-[9px] tracking-wide capitalize"
                  >
                    {client.activity ?? "None"}
                  </Badge>
                </div>

                {/* Created */}
                <div className={cn(COL_CLASSES, COLS.created, "whitespace-nowrap")}>
                  <p className="text-[11px] font-medium" suppressHydrationWarning>
                    {formatDateTimeShortMonth(client.createdAt)}
                  </p>
                </div>
                {/* Status */}
                <div className={cn(COL_CLASSES, COLS.status, "whitespace-nowrap")}>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 font-bold uppercase text-[9px] tracking-wider",
                      getPipelineStatusColor(client.status)
                    )}
                  >
                    {client.status.replace(/_/g, " ")}
                  </Badge>
                </div>



                {/* Priority */}
                <div className={cn(COL_CLASSES, COLS.priority, "whitespace-nowrap")}>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 font-bold uppercase text-[9px] tracking-wider",
                      getPipelinePriorityColor(client.priority)
                    )}
                  >
                    {client.priority}
                  </Badge>
                </div>

                {/* Sales Person */}
                <div className={cn(COL_CLASSES, COLS.sales, "whitespace-nowrap")}>
                  {client.salesPerson ? (
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[12px] font-bold leading-none">{client.salesPerson.name}</span>
                      <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[8px] font-semibold tracking-wider uppercase rounded-sm"
                      >
                        {ROLE_LABELS[client.salesPerson.role] || client.salesPerson.role.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-1">
                      {(user?.role === "admin" || user?.role === "leadSales") && (
                        <AssignSalesDialog companyName={client.companyName} clientId={client._id} />
                      )}
                      {(user?.role === "admin" || user?.role === "leadSales" || user?.role === "sales") && (
                        <ClaimLeadDialog companyName={client.companyName} clientId={client._id} />
                      )}
                      {!user?.role && <span className="italic text-muted-foreground text-xs">None</span>}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className={cn(COL_CLASSES, COLS.action)}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-lg">
                      <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setClientToEdit(client)}>
                        Edit
                      </DropdownMenuItem>
                      {(user?.role === "admin" || user?.role === "leadSales") && client.salesPerson && (
                        <AssignSalesDialog
                          companyName={client.companyName}
                          clientId={client._id}
                          initialUserId={client.salesPersonId}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              Reassign Lead
                            </DropdownMenuItem>
                          }
                        />
                      )}
                      {user?.role === "admin" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setClientToDelete(client);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
          <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <PipelineClientDetailsDialog client={selectedClient} onClose={() => setSelectedClient(null)} />
      {clientToEdit && (
        <EditProspectDialog
          client={clientToEdit}
          open={true}
          onOpenChange={(open) => !open && setClientToEdit(null)}
        />
      )}
      {clientToDelete && (
        <DeleteProspectDialog
          clientId={clientToDelete._id}
          companyName={clientToDelete.companyName}
          open={!!clientToDelete}
          onOpenChange={(open) => !open && setClientToDelete(null)}
        />
      )}

      <PipelineBulkActions
        selectedIds={selectedIds}
        clients={clients}
        onClear={() => setSelectedIds(new Set())}
        onBatchUpdateSuccess={() => setSelectedIds(new Set())}
        onBatchDeleteSuccess={() => setSelectedIds(new Set())}
        userRole={user?.role}
      />
    </div>
  );
}