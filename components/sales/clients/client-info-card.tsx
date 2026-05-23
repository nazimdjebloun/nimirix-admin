"use client"

import { Mail, Briefcase, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Doc } from "@/convex/_generated/dataModel"
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils"
import { formatPhone } from "@/lib/utils/format-phone"
import { ROLE_LABELS } from "@/lib/auth/roles"

interface ClientInfoCardProps {
  client: Doc<"clients"> & {
    salesPerson: { _id: string; name: string; email: string; role: string } | null
  }
  collaborators: { _id: string; name: string; email: string }[]
}

export function ClientInfoCard({ client, collaborators }: ClientInfoCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/45 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
