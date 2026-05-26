import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import type { Doc, Id } from "../../_generated/dataModel"
import type { QueryCtx } from "../../_generated/server"
import { query } from "../../_generated/server"
import { requireRoles } from "../../users"

const billingStateValidator = v.union(
  v.literal("all"),
  v.literal("with_balance"),
  v.literal("unpaid"),
  v.literal("partially_paid"),
  v.literal("paid_in_full")
)

const billingSortValidator = v.union(
  v.literal("highest_balance"),
  v.literal("lowest_balance"),
  v.literal("recent_payment"),
  v.literal("company")
)

type BillingState = "unpaid" | "partially_paid" | "paid_in_full"

interface ProjectPaymentSummary {
  paidAmount: number
  refundedAmount: number
  balance: number
  billingState: BillingState
  lastPaymentAt?: number
  paymentCount: number
}

function sumActivePayments(payments: Doc<"payments">[]): number {
  return payments.reduce((sum, payment) => {
    if (payment.paymentStatus === "refunded") {
      return sum
    }

    return sum + payment.amount
  }, 0)
}

function getLatestActivePaymentDate(
  payments: Doc<"payments">[]
): number | undefined {
  const activePayments = payments.filter(
    (payment) => payment.paymentStatus !== "refunded"
  )

  if (activePayments.length === 0) {
    return undefined
  }

  return activePayments.reduce((latest, payment) => {
    return payment.paymentDate > latest ? payment.paymentDate : latest
  }, activePayments[0].paymentDate)
}

function buildProjectPaymentSummary(
  project: Doc<"projects">,
  payments: Doc<"payments">[]
): ProjectPaymentSummary {
  const paidAmount = sumActivePayments(payments)
  const refundedAmount = payments.reduce((sum, payment) => {
    if (payment.paymentStatus !== "refunded") {
      return sum
    }

    return sum + payment.amount
  }, 0)
  const balance = Math.max(project.price - paidAmount, 0)

  if (paidAmount <= 0) {
    return {
      paidAmount: 0,
      refundedAmount,
      balance: project.price,
      billingState: "unpaid",
      lastPaymentAt: undefined,
      paymentCount: 0,
    }
  }

  if (paidAmount >= project.price) {
    return {
      paidAmount,
      refundedAmount,
      balance: 0,
      billingState: "paid_in_full",
      lastPaymentAt: getLatestActivePaymentDate(payments),
      paymentCount: payments.filter(
        (payment) => payment.paymentStatus !== "refunded"
      ).length,
    }
  }

  return {
    paidAmount,
    refundedAmount,
    balance,
    billingState: "partially_paid",
    lastPaymentAt: getLatestActivePaymentDate(payments),
    paymentCount: payments.filter(
      (payment) => payment.paymentStatus !== "refunded"
    ).length,
  }
}

function matchesClientBillingFilter(
  billingState: BillingState,
  filter: "all" | "with_balance" | BillingState
): boolean {
  if (filter === "all") {
    return true
  }

  if (filter === "with_balance") {
    return billingState !== "paid_in_full"
  }

  return billingState === filter
}

function sortBillingSummaries<
  T extends {
    companyName: string
    outstandingBalance: number
    lastPaymentAt?: number
  },
>(
  summaries: T[],
  sortBy: "highest_balance" | "lowest_balance" | "recent_payment" | "company"
) {
  summaries.sort((left, right) => {
    if (sortBy === "lowest_balance") {
      return (
        left.outstandingBalance - right.outstandingBalance ||
        left.companyName.localeCompare(right.companyName)
      )
    }

    if (sortBy === "recent_payment") {
      return (
        (right.lastPaymentAt ?? 0) - (left.lastPaymentAt ?? 0) ||
        right.outstandingBalance - left.outstandingBalance
      )
    }

    if (sortBy === "company") {
      return left.companyName.localeCompare(right.companyName)
    }

    return (
      right.outstandingBalance - left.outstandingBalance ||
      (right.lastPaymentAt ?? 0) - (left.lastPaymentAt ?? 0)
    )
  })
}

async function enrichBillingSummaries(
  ctx: QueryCtx,
  summaries: Array<{
    _id: Id<"clientBillingSummaries">
    clientId: Id<"clients">
    companyName: string
    totalProjectValue: number
    totalPaid: number
    outstandingBalance: number
    hasOutstandingBalance: boolean
    totalProjects: number
    completedProjects: number
    ongoingProjects: number
    paidProjects: number
    partiallyPaidProjects: number
    unpaidProjects: number
    lastPaymentAt?: number
    billingState: BillingState
    updatedAt: number
  }>
) {
  const enriched = await Promise.all(
    summaries.map(async (summary) => {
      const client = await ctx.db.get(summary.clientId)

      return {
        ...summary,
        companyName: client?.companyName ?? summary.companyName,
        contact: client?.contact ?? "",
        email: client?.email ?? "",
        phone: client?.phone,
      }
    })
  )

  return enriched
}

export const getClientsWithPendingPayment = query({
  args: {
    search: v.optional(v.string()),
    billingState: v.optional(billingStateValidator),
    sortBy: v.optional(billingSortValidator),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const searchTerm = args.search?.trim().toLowerCase()
    const filterState = args.billingState ?? "all"
    const sortBy = args.sortBy ?? "highest_balance"

    if (searchTerm) {
      const summaries = await ctx.db
        .query("clientBillingSummaries")
        .withSearchIndex("search_company", (q) =>
          q.search("companyName", searchTerm)
        )
        .collect()

      const filtered = summaries.filter((summary) =>
        matchesClientBillingFilter(summary.billingState, filterState)
      )

      sortBillingSummaries(filtered, sortBy)

      const start = Number(args.paginationOpts.cursor || 0)
      const end = start + args.paginationOpts.numItems
      const page = await enrichBillingSummaries(ctx, filtered.slice(start, end))
      const isDone = end >= filtered.length

      return {
        page,
        isDone,
        continueCursor: isDone ? "" : String(end),
      }
    }

    const order =
      sortBy === "lowest_balance" || sortBy === "company" ? "asc" : "desc"

    const paginatedResults =
      sortBy === "recent_payment"
        ? filterState === "with_balance"
          ? await ctx.db
              .query("clientBillingSummaries")
              .withIndex("by_has_outstanding_balance_last_payment_at", (q) =>
                q.eq("hasOutstandingBalance", true)
              )
              .order("desc")
              .paginate(args.paginationOpts)
          : filterState !== "all"
            ? await ctx.db
                .query("clientBillingSummaries")
                .withIndex("by_billing_state_last_payment_at", (q) =>
                  q.eq("billingState", filterState)
                )
                .order("desc")
                .paginate(args.paginationOpts)
            : await ctx.db
                .query("clientBillingSummaries")
                .withIndex("by_last_payment_at")
                .order("desc")
                .paginate(args.paginationOpts)
        : sortBy === "company"
          ? filterState === "with_balance"
            ? await ctx.db
                .query("clientBillingSummaries")
                .withIndex("by_has_outstanding_balance_company_name", (q) =>
                  q.eq("hasOutstandingBalance", true)
                )
                .paginate(args.paginationOpts)
            : filterState !== "all"
              ? await ctx.db
                  .query("clientBillingSummaries")
                  .withIndex("by_billing_state_company_name", (q) =>
                    q.eq("billingState", filterState)
                  )
                  .paginate(args.paginationOpts)
              : await ctx.db
                  .query("clientBillingSummaries")
                  .withIndex("by_company_name")
                  .paginate(args.paginationOpts)
          : filterState === "with_balance"
            ? await ctx.db
                .query("clientBillingSummaries")
                .withIndex(
                  "by_has_outstanding_balance_outstanding_balance",
                  (q) => q.eq("hasOutstandingBalance", true)
                )
                .order(order)
                .paginate(args.paginationOpts)
            : filterState !== "all"
              ? await ctx.db
                  .query("clientBillingSummaries")
                  .withIndex("by_billing_state_outstanding_balance", (q) =>
                    q.eq("billingState", filterState)
                  )
                  .order(order)
                  .paginate(args.paginationOpts)
              : await ctx.db
                  .query("clientBillingSummaries")
                  .withIndex("by_outstanding_balance")
                  .order(order)
                  .paginate(args.paginationOpts)

    return {
      ...paginatedResults,
      page: await enrichBillingSummaries(ctx, paginatedResults.page),
    }
  },
})

export const getClientPayementStats = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const summary = await ctx.db
      .query("clientBillingSummaries")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .first()

    if (!summary) {
      return {
        totalProjects: 0,
        totalProjectValue: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        paidProjects: 0,
        partiallyPaidProjects: 0,
        unpaidProjects: 0,
        lastPaymentAt: undefined,
      }
    }

    return {
      totalProjects: summary.totalProjects,
      totalProjectValue: summary.totalProjectValue,
      totalPaid: summary.totalPaid,
      outstandingBalance: summary.outstandingBalance,
      paidProjects: summary.paidProjects,
      partiallyPaidProjects: summary.partiallyPaidProjects,
      unpaidProjects: summary.unpaidProjects,
      lastPaymentAt: summary.lastPaymentAt,
    }
  },
})

export const getClientProjects = query({
  args: {
    clientId: v.id("clients"),
    status: v.optional(v.string()),
    paidInFullFilter: v.optional(v.boolean()),
    billingState: v.optional(
      v.union(
        v.literal("all"),
        v.literal("unpaid"),
        v.literal("partially_paid"),
        v.literal("paid_in_full")
      )
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const [projects, payments] = await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect(),
      ctx.db
        .query("payments")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect(),
    ])

    const statusFilter = args.status
    const billingFilter = args.billingState ?? "all"
    const filteredProjects = projects
      .map((project) => {
        const projectPayments = payments.filter(
          (payment) => payment.projectId === project._id
        )
        const summary = buildProjectPaymentSummary(project, projectPayments)

        return {
          ...project,
          paidAmount: summary.paidAmount,
          refundedAmount: summary.refundedAmount,
          remainingBalance: summary.balance,
          billingState: summary.billingState,
          lastPaymentAt: summary.lastPaymentAt,
          paymentCount: summary.paymentCount,
        }
      })
      .filter((project) => {
        if (statusFilter && project.status !== statusFilter) {
          return false
        }

        if (
          args.paidInFullFilter !== undefined &&
          (project.billingState === "paid_in_full") !== args.paidInFullFilter
        ) {
          return false
        }

        if (billingFilter !== "all" && project.billingState !== billingFilter) {
          return false
        }

        return true
      })
      .sort((left, right) => {
        return (
          right.updatedAt - left.updatedAt ||
          right.createdAt - left.createdAt ||
          left.name.localeCompare(right.name)
        )
      })

    const start = Number(args.paginationOpts.cursor || 0)
    const end = start + args.paginationOpts.numItems
    const page = filteredProjects.slice(start, end)
    const isDone = end >= filteredProjects.length

    return {
      page,
      isDone,
      continueCursor: isDone ? "" : String(end),
    }
  },
})

export const getClientPayments = query({
  args: {
    clientId: v.id("clients"),
    search: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const order = args.sortOrder === "oldest" ? "asc" : "desc"

    if (args.search) {
      const term = args.search.toLowerCase()
      const allPayments = await ctx.db
        .query("payments")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect()

      const filtered = allPayments.filter((payment) =>
        new Date(payment.paymentDate).toLocaleDateString("en-GB").includes(term)
      )

      const page = filtered.slice(0, args.paginationOpts.numItems)
      const isDone = filtered.length <= args.paginationOpts.numItems

      return {
        page,
        isDone,
        continueCursor: "",
      }
    }

    return await ctx.db
      .query("payments")
      .withIndex("by_client_payment_date", (q) =>
        q.eq("clientId", args.clientId)
      )
      .order(order)
      .paginate(args.paginationOpts)
  },
})

export const getProjectPaymentsTotal = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    return sumActivePayments(payments)
  },
})

export const getClientWithProjects = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const client = await ctx.db.get(args.clientId)
    if (!client) {
      throw new Error("Client not found")
    }

    return { client }
  },
})
