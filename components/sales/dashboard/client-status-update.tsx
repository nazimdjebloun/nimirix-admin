"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowRight } from "lucide-react";
import {
  getPipelineStatusColor,
  getPipelineStatusLabel,
  getPipelineStatusTextColor,
} from "@/components/sales/lib/helpers";

const STATUS_KEYS = [
  "prospect",
  "initial_contact",
  "negotiation",
  "verbal_agreement",
  "converted",
  "lost",
  "out_of_target",
] as const;

interface StatusBadgeDropdownProps {
  clientId: Doc<"clients">["_id"];
  currentStatus: Doc<"clients">["status"];
}

export function StatusBadgeDropdown({ clientId, currentStatus }: StatusBadgeDropdownProps) {
  const updateStatus = useMutation(api.sales.dashboard.mutations.updateStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    await updateStatus({
      id: clientId,
      status: newStatus as typeof currentStatus,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-0.5 cursor-pointer group/badge focus:outline-none">
          <Badge 
            variant="outline" 
            className={`rounded-md px-2 font-bold uppercase text-[9px] tracking-wider shrink-0 transition-all duration-200 ${getPipelineStatusColor(currentStatus)}`}
          >
            {getPipelineStatusLabel(currentStatus)}
            <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Move to
        </div>
        <DropdownMenuSeparator />
        {STATUS_KEYS.map((key) => {
          const isCurrent = key === currentStatus;
          return (
            <DropdownMenuItem
              key={key}
              className={`text-xs font-semibold gap-2 ${isCurrent ? "bg-secondary/50" : ""}`}
              onClick={() => handleStatusChange(key)}
              disabled={isCurrent}
            >
              <ArrowRight className={`w-3 h-3 ${getPipelineStatusTextColor(key)}`} />
              {getPipelineStatusLabel(key)}
              {isCurrent && (
                <span className="text-[9px] text-muted-foreground ml-auto">current</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}