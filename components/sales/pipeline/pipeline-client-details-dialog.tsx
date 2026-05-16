

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDateTimeShortMonth } from "@/lib/utils/date-utils";
import { 
  Building2, 
  User, 
  Scale, 
  FileText,
  type LucideIcon
} from "lucide-react";
import { formatPhone } from "@/lib/utils/format-phone";

type Client = typeof api.sales.pipeline.queries.getPipeline._returnType["page"][0];

interface PipelineClientDetailsDialogProps {
  client: Client | null;
  onClose: () => void;
}

function SectionCard({ 
  title, 
  icon: Icon, 
  children,
  className = "" 
}: { 
  title: string; 
  icon: LucideIcon; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border bg-muted/20 overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
        <Icon className="w-4 h-4 text-foreground" />
        <h3 className="font-black uppercase tracking-widest text-foreground">
          {title}
        </h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{label}</span>
      <div className="text-sm font-medium text-foreground wrap-break-word">
        {value || <span className="text-muted-foreground/70 italic">Not provided</span>}
      </div>
    </div>
  );
}

function formatUserRef(user: { name: string; role: string } | null): React.ReactNode {
  if (!user) return "-";
  const roleLabel = ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role.replace(/_/g, " ");
  
  return (
    <div className="flex flex-col leading-none">
      <span className="text-sm font-bold">{user.name}</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">
        {roleLabel}
      </span>
    </div>
  );
}

export function PipelineClientDetailsDialog({ client, onClose }: PipelineClientDetailsDialogProps) {
  if (!client) return null;

  return (
    <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-125 h-[88vh] p-0 flex flex-col gap-0 overflow-hidden border-none shadow-2xl rounded-3xl"
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 py-5 border-b shrink-0 bg-accent/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <DialogTitle className="text-2xl font-black tracking-tighter leading-none">
              {client.companyName}
            </DialogTitle>
            <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none">
                Added by {client.createdByUser?.name || "-"} • {formatDateTimeShortMonth(client.createdAt)}
              </span>
              <span className="text-[9px] text-muted-foreground/60 font-medium uppercase tracking-widest leading-none">
                Updated {formatDateTimeShortMonth(client.updatedAt)}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4 flex flex-col gap-4">            {/* Section 1: Business Identity */}
            <SectionCard title="Business Identity" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem label="Email Address" value={client.email} />
                <DetailItem label="Primary Phone" value={client.phone && formatPhone(client.phone)} />
                <DetailItem label="Business Activity" value={client.activity} />
                <DetailItem label="Lead Source" value={<span className="capitalize">{client.source?.replace(/_/g, " ")}</span>} />
              </div>
              <div className="mt-6 pt-6 border-t">
                <DetailItem label="Office Address" value={client.address} />
              </div>
            </SectionCard>

            {/* Section 2: Contact Person */}
            <SectionCard title="Key Contact" icon={User}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <DetailItem label="Full Name" value={client.contact} />
                <DetailItem label="Contact Phone" value={client.contactPhone && formatPhone(client.contactPhone)} />
              </div>
            </SectionCard>

            {/* Section 3: Legal & Compliance */}
            <SectionCard title="Legal & Compliance" icon={Scale}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <DetailItem label="NIF" value={client.nif} />
                <DetailItem label="RC" value={client.rc} />
                <DetailItem label="Contract Date" value={client.signDate ? formatDateTimeShortMonth(client.signDate) : "-"} />
              </div>
            </SectionCard>

            {/* Section 4: Notes */}
            {client.notes && (
              <SectionCard title="Internal Notes" icon={FileText} className="bg-amber-500/5 border-amber-500/20">
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  {client.notes}
                </p>
              </SectionCard>
            )}

            <div className="h-4" />
          </div>
        </ScrollArea>

        {/* Sticky Footer for Operations Info */}
        <div className="shrink-0 border-t bg-muted/40 px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DetailItem label="Assigned To" value={formatUserRef(client.salesPerson)} />
            <DetailItem label="Assigned By" value={formatUserRef(client.assignedByUser)} />
            <DetailItem label="Assigned At" value={client.assignedAt ? formatDateTimeShortMonth(client.assignedAt) : "-"} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


