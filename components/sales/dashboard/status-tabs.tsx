"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientStatusTable } from "@/components/sales/dashboard/client-status-table";
import { Check, X, MousePointer2Off } from "lucide-react";

export function StatusTabs() {
  const [activeTab, setActiveTab] = useState("converted");

  return (
    <Card className="  bg-background  overflow-hidden">
      <CardHeader className=" pb-0">
        <div className="flex justify-between items-center mb-1 px-1">
          <CardTitle className="text-[11px] font-black tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            Historique & Résultats
          </CardTitle>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-secondary/40 p-1 h-8 w-full ">
            <TabsTrigger
              value="converted"
              className="flex-1 gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-emerald-500  uppercase"
            >
              <Check className="w-3 h-3" />
              CONVERTIS
            </TabsTrigger>
            <TabsTrigger
              value="lost"
              className="flex-1 gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-destructive  uppercase"
            >
              <X className="w-3 h-3" />
              PERDUS
            </TabsTrigger>
            <TabsTrigger
              value="hors-cible"
              className="flex-1 gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-orange-500  uppercase"
            >
              <MousePointer2Off className="w-3 h-3" />
              HORS CIBLE
            </TabsTrigger>
          </TabsList>

          <div className="">
            <TabsContent value="converted" className="mt-0">
              <ClientStatusTable
                status="converted"
              />
            </TabsContent>
            <TabsContent value="lost" className="mt-0">
              <ClientStatusTable
                status="lost"
              />
            </TabsContent>
            <TabsContent value="hors-cible" className="mt-0">
              <ClientStatusTable
                status="out_of_target"
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
