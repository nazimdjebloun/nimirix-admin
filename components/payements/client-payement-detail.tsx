"use client"

import { useState } from "react"
import { useConvexAuth, useQuery } from "convex/react"
import Link from "next/link"
import { Building2, ChevronLeft, CreditCard, History } from "lucide-react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { ClientHeaderCard } from "./client-header-card"
import { PaymentsSection } from "./payments-section"
import { ProjectsSection } from "./projects-section"
import { StatsCards } from "./stats-cards"

interface ClientPayementDetailProps {
  clientId: Id<"clients">
}

export function ClientPayementDetail({ clientId }: ClientPayementDetailProps) {
  const [billingTab, setBillingTab] = useState<
    "all" | "unpaid" | "partially_paid" | "paid_in_full"
  >("all")
  const { isAuthenticated } = useConvexAuth()

  const clientData = useQuery(
    api.admin.payements.queries.getClientWithProjects,
    isAuthenticated ? { clientId } : "skip"
  )
  const stats = useQuery(
    api.admin.payements.queries.getClientPayementStats,
    isAuthenticated ? { clientId } : "skip"
  )

  if (!clientData || stats === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="" />
      </div>
    )
  }

  const { client } = clientData

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 md:px-0">
      <div className="flex flex-col gap-3">
        <Link
          href="/payements"
          className="flex w-fit items-center gap-1.5 text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Billing
        </Link>
        <div className="flex items-center gap-2.5">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {client.companyName}
            </h1>
            <p className="text-xs text-muted-foreground">
              Billing and payment overview
            </p>
          </div>
        </div>
      </div>

      <ClientHeaderCard client={client} />

      <StatsCards
        totalProjects={stats.totalProjects}
        totalProjectValue={stats.totalProjectValue}
        totalPaid={stats.totalPaid}
        outstandingBalance={stats.outstandingBalance}
        paidProjects={stats.paidProjects}
        partiallyPaidProjects={stats.partiallyPaidProjects}
        unpaidProjects={stats.unpaidProjects}
        lastPaymentAt={stats.lastPaymentAt}
      />

      <Separator className="my-2" />

      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-black tracking-tight text-foreground">
          Projects & Balances
        </h2>
      </div>

      <Tabs
        defaultValue="all"
        value={billingTab}
        onValueChange={(value) =>
          setBillingTab(
            value as "all" | "unpaid" | "partially_paid" | "paid_in_full"
          )
        }
        className="w-full"
      >
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border bg-accent/60 p-1 md:w-fit">
          <TabsTrigger
            value="all"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="unpaid"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Unpaid
          </TabsTrigger>
          <TabsTrigger
            value="partially_paid"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Partially Paid
          </TabsTrigger>
          <TabsTrigger
            value="paid_in_full"
            className="rounded-lg py-1.5 text-[10px] font-bold uppercase"
          >
            Paid in Full
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <ProjectsSection clientId={clientId} billingState={billingTab} />

      <Separator className="my-2" />

      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-black tracking-tight text-foreground">
          Payment History
        </h2>
      </div>

      <PaymentsSection clientId={clientId} />
    </div>
  )
}
