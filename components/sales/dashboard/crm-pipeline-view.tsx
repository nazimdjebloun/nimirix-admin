// "use client";

// import { useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { PipelineStage } from "@/components/sales/dashboard/pipeline-stage";
// import { StatusTabs } from "@/components/sales/dashboard/status-tabs";
// import { TodayActionCenter } from "@/components/sales/dashboard/today-action-center";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { useMemo } from "react";

// export function CrmPipelineView() {
//   const { currentTime, startOfDay, endOfDay } = useMemo(() => {
//     const now = new Date();
//     return {
//       currentTime: now.getTime(),
//       startOfDay: new Date(now).setHours(0, 0, 0, 0),
//       endOfDay: new Date(now).setHours(23, 59, 59, 999),
//     };
//   }, []);

//   const stats = useQuery(api.sales.getDashboardStats, { currentTime });
//   const todayActions = useQuery(api.sales.getActionCenterToday, { startOfDay, endOfDay });
//   const upcomingReminders = useQuery(api.sales.getUpcomingReminders, { endOfDay });
//   const hygiene = useQuery(api.sales.getDashboardHygiene, { currentTime });

//   return (
//     <div className="h-full space-y-8 p-6 bg-linear-to-br from-background to-secondary/10">
//       {/* Header Info */}
//       <div className="flex flex-col gap-1">
//         <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
//           Pipeline CRM
//           <span className="text-primary animate-pulse">.</span>
//         </h1>
//         <p className="text-muted-foreground font-medium">
//           Gérez votre pipeline de vente et suivez vos interactions clients.
//         </p>
//       </div>

//       <ScrollArea className="h-[calc(100vh-180px)] pr-4">
//         <div className="space-y-10 pb-10">
//           {/* Today's Action Center */}
//           {todayActions && upcomingReminders && hygiene && (
//             <section>
//               <TodayActionCenter
//                 today={todayActions}
//                 upcoming={upcomingReminders}
//                 hygiene={hygiene}
//                 currentTime={currentTime}
//               />
//             </section>
//           )}

//           {/* Big Card: Lost & Converted */}
//           <section className="space-y-4">
//             <StatusTabs />
//           </section>

//           {/* Pipeline Grid: 3 Stages */}
//           <section className="space-y-4">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="h-1 w-8 bg-primary rounded-full" />
//               <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
//                 Étapes de Négociation
//               </h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <PipelineStage 
//                 title="Premier Contact" 
//                 status="initial_contact" 
//                 count={stats?.pipeline.initial_contact}
//               />
//               <PipelineStage 
//                 title="Négociation" 
//                 status="negotiation" 
//                 count={stats?.pipeline.negotiation}
//               />
//               <PipelineStage 
//                 title="Accord Verbal" 
//                 status="verbal_agreement" 
//                 count={stats?.pipeline.verbal_agreement}
//               />
//             </div>
//           </section>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }

