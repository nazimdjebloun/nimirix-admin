"use client"

import { Doc } from "@/convex/_generated/dataModel"
import { Building2, Mail, Phone, MapPin, Receipt, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ClientHeaderCardProps {
  client: Doc<"clients">
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-border/10 py-1.5 last:border-0 lg:flex-row lg:items-center lg:justify-between lg:gap-3 lg:py-1">
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="min-w-0 truncate text-left font-extrabold text-foreground lg:text-right">
        {value}
      </span>
    </div>
  )
}

export function ClientHeaderCard({ client }: ClientHeaderCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card/45 p-0">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Mail className="h-3.5 w-3.5 text-primary/70" />
              <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Contact Information
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <InfoRow icon={Mail} label="Email" value={client.email} />
              {client.contactEmail && (
                <InfoRow
                  icon={Mail}
                  label="Contact Email"
                  value={client.contactEmail}
                />
              )}
              <InfoRow
                icon={Building2}
                label="Contact Person"
                value={client.contact}
              />
              <InfoRow
                icon={Phone}
                label="Contact Phone"
                value={client.contactPhone || "-"}
              />

              <InfoRow icon={Phone} label="Phone" value={client.phone || "-"} />
              <InfoRow
                icon={Phone}
                label="Secondary Phone"
                value={client.secondaryPhone || "-"}
              />

              <InfoRow
                icon={MapPin}
                label="Address"
                value={client.address || "-"}
              />
            </div>
          </div>

          {/* Registry */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <Receipt className="h-3.5 w-3.5 text-primary/70" />
              <h3 className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Registry
              </h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <InfoRow icon={FileText} label="NIF" value={client.nif || "-"} />
              <InfoRow icon={FileText} label="RC" value={client.rc || "-"} />
              <InfoRow
                icon={FileText}
                label="Activity"
                value={client.activity || "-"}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
