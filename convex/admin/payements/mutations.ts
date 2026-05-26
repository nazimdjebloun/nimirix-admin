import type { Doc } from "../../_generated/dataModel"
import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { requireRoles } from "../../users"
import { syncBillingSummary } from "./syncBillingSummary"

function getActivePayments(payments: Doc<"payments">[]) {
  return payments.filter((payment) => payment.paymentStatus !== "refunded")
}

function getTotalPaid(payments: Doc<"payments">[]) {
  return getActivePayments(payments).reduce((sum, payment) => {
    return sum + payment.amount
  }, 0)
}

function getEarliestPaymentDate(payments: Doc<"payments">[]) {
  const activePayments = getActivePayments(payments)

  if (activePayments.length === 0) {
    return undefined
  }

  return activePayments.reduce((earliest, payment) => {
    return payment.paymentDate < earliest ? payment.paymentDate : earliest
  }, activePayments[0].paymentDate)
}

function getLatestPaymentDate(payments: Doc<"payments">[]) {
  const activePayments = getActivePayments(payments)

  if (activePayments.length === 0) {
    return undefined
  }

  return activePayments.reduce((latest, payment) => {
    return payment.paymentDate > latest ? payment.paymentDate : latest
  }, activePayments[0].paymentDate)
}

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
    if (!project) {
      throw new Error("Project not found")
    }

    if (args.amount <= 0) {
      throw new Error("Payment amount must be greater than zero")
    }

    const existingPayments = await ctx.db
      .query("payments")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    const totalPaidBefore = getTotalPaid(existingPayments)
    const remainingBalance = Math.max(project.price - totalPaidBefore, 0)

    if (remainingBalance <= 0) {
      throw new Error("This project is already fully paid")
    }

    if (args.amount > remainingBalance) {
      throw new Error(
        `Payment exceeds remaining balance of ${remainingBalance.toLocaleString()} DZD`
      )
    }

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

    const totalPaid = getTotalPaid(allPayments)
    const isPaidInFull = totalPaid >= project.price

    await ctx.db.patch(args.projectId, {
      paidInFull: isPaidInFull,
      initialPaymentAt: getEarliestPaymentDate(allPayments),
      lastPaymentAt: getLatestPaymentDate(allPayments),
      status:
        project.status === "pending_initial_payment" && totalPaid > 0
          ? "pending"
          : project.status,
      updatedAt: now,
    })

    await syncBillingSummary(ctx, project.clientId)

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
    if (!payment) {
      throw new Error("Payment not found")
    }

    if (payment.paymentStatus === "refunded") {
      throw new Error("Payment already refunded")
    }

    const project = await ctx.db.get(payment.projectId)
    if (!project) {
      throw new Error("Project not found")
    }

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

    const totalPaid = getTotalPaid(allPayments)
    const isPaidInFull = totalPaid >= project.price

    let nextStatus = project.status

    if (totalPaid <= 0) {
      nextStatus = "pending_initial_payment"
    } else if (
      totalPaid < project.price &&
      (project.status === "pending_payment" ||
        project.status === "delivered" ||
        project.paidInFull === true)
    ) {
      nextStatus = "pending_payment"
    }

    await ctx.db.patch(payment.projectId, {
      paidInFull: isPaidInFull,
      initialPaymentAt: getEarliestPaymentDate(allPayments),
      lastPaymentAt: getLatestPaymentDate(allPayments),
      status: nextStatus,
      updatedAt: now,
    })

    await syncBillingSummary(ctx, project.clientId)

    return { success: true }
  },
})

export const syncClientBillingSummary = mutation({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"])

    await syncBillingSummary(ctx, args.clientId)

    return { success: true }
  },
})

export const syncAllBillingSummaries = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRoles(ctx, ["admin"])

    const clients = await ctx.db
      .query("clients")
      .withIndex("by_status", (q) => q.eq("status", "converted"))
      .collect()

    for (const client of clients) {
      await syncBillingSummary(ctx, client._id)
    }

    return { success: true, count: clients.length }
  },
})
