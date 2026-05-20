"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddProspectDialog } from "./create-lead-dialog";

export function PipelineHeader() {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sales Pipeline</h1>
        <p className="text-muted-foreground text-sm font-medium">
          Track leads, manage interactions, and close deals.
        </p>
      </div>
      <AddProspectDialog>
        <Button className="text-sm py-4 px-6 font-semibold ">
          <Plus className="w-5 h-5 mr-2" />
          New Lead
        </Button>
      </AddProspectDialog>
    </div>
  );
} 
