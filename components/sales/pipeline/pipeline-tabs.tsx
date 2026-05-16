"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PipelineTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function PipelineTabs({ activeTab, onTabChange }: PipelineTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="p-1 w-full flex justify-center items-center ">
{/* <TabsList className="w-full flex flex-wrap gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">   */}
<TabsList className=" flex flex-wrap gap-3  p-1 h-auto! [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">  {/* <TabsList className="w-full flex flex-nowrap gap-3 overflow-x-auto "> */}
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="prospect">Prospect</TabsTrigger>
          <TabsTrigger value="initial_contact">Initial Contact</TabsTrigger>
          <TabsTrigger value="negotiation">Negotiation</TabsTrigger>
          <TabsTrigger value="verbal_agreement">Verbal Agreement</TabsTrigger>
          <TabsTrigger value="lost">Lost</TabsTrigger>  
          <TabsTrigger value="out_of_target">Out of Target</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
        
      </TabsList>   
    </Tabs>
  );
}
     