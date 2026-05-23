import { v } from "convex/values"
import { query } from "../../_generated/server"
import { paginationOptsValidator } from "convex/server"
import { requireRoles } from "../../users"

export const getClientsWithPendingPayment = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const pendingProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_payment"))
      .collect()

    const initialPaymentProjects = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "pending_initial_payment"))
      .collect()

    const clientIds = [...new Set([...pendingProjects, ...initialPaymentProjects].map((p) => p.clientId))]

    if (clientIds.length === 0) {
      return { page: [], isDone: true, continueCursor: "" }
    }

    const results = await ctx.db
      .query("clients")
      .filter((q) =>
        q.or(...clientIds.map((id) => q.eq(q.field("_id"), id)))
      )
      .paginate(args.paginationOpts)

    return results
  },
})

export const getClientInvoiceStats = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect()

    return {
      total: projects.length,
      pendingPayment: projects.filter((p) => p.status === "pending_payment").length,
      delivered: projects.filter((p) => p.status === "delivered").length,
      paused: projects.filter((p) => p.status === "paused").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
    }
  },
})

export const getClientProjects = query({
  args: {
    clientId: v.id("clients"),
    status: v.optional(v.string()),
    paidInFullFilter: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    let baseQuery = ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))

    if (args.status) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    if (args.paidInFullFilter !== undefined) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("paidInFull"), args.paidInFullFilter)
      )
    }

    return await baseQuery.paginate(args.paginationOpts)
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

      const filtered = allPayments.filter((p) => {
        return new Date(p.paymentDate)
          .toLocaleDateString("en-GB")
          .includes(term)
      })

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

    return payments.reduce((sum, p) => {
      if (p.paymentStatus === "refunded") return sum
      return sum + p.amount
    }, 0)
  },
})

export const getClientWithProjects = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    const client = await ctx.db.get(args.clientId)
    if (!client) throw new Error("Client not found")

    return { client }
  },
})
