import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireRoles } from "../../users"

export const createPayment = mutation({
  args: {
    projectId: v.id("projects"),
    amount: v.number(),
    paymentMethod: v.union(
      v.literal("bank_transfer"),
      v.literal("cash"),
      v.literal("check"),
      v.literal("card")
    ),
    paymentDate: v.number(),
    discountAmount: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin"])

    const project = await ctx.db.get(args.projectId)
    if (!project) throw new Error("Project not found")

    const now = Date.now()
    const taxAmount = Math.round(args.amount * 0.19)

    await ctx.db.insert("payments", {
      projectId: args.projectId,
      clientId: project.clientId,
      amount: args.amount,
      paymentMethod: args.paymentMethod,
      taxAmount,
      discountAmount: args.discountAmount,
      paymentStatus: "paid",
      paymentDate: args.paymentDate,
      notes: args.notes,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
      updatedBy: user._id,
    })

    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    const totalPaid = allPayments.reduce((sum, p) => {
      if (p.paymentStatus === "refunded") return sum
      return sum + p.amount
    }, 0)
    const isPaidInFull = totalPaid >= project.price

    await ctx.db.patch(args.projectId, {
      paidInFull: isPaidInFull,
      updatedAt: now,
    })

    if (!isPaidInFull && project.status === "pending_initial_payment") {
      await ctx.db.patch(args.projectId, {
        status: "pending",
        updatedAt: now,
      })
    }

    return { success: true }
  },
})

export const refundPayment = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin"])

    const payment = await ctx.db.get(args.paymentId)
    if (!payment) throw new Error("Payment not found")
    if (payment.paymentStatus === "refunded") throw new Error("Payment already refunded")

    const now = Date.now()

    await ctx.db.patch(args.paymentId, {
      paymentStatus: "refunded",
      refundedAt: now,
      refundedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    })

    const allPayments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", payment.projectId))
      .collect()

    const totalPaid = allPayments.reduce((sum, p) => {
      if (p.paymentStatus === "refunded") return sum
      return sum + p.amount
    }, 0)

    const project = await ctx.db.get(payment.projectId)
    if (!project) throw new Error("Project not found")

    const isPaidInFull = totalPaid >= project.price

    await ctx.db.patch(payment.projectId, {
      paidInFull: isPaidInFull,
      status: "pending_payment",
      updatedAt: now,
    })

    return { success: true }
  },
})
