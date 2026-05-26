import type { Doc, Id } from "../../_generated/dataModel"
import type { MutationCtx } from "../../_generated/server"

type BillingState = "unpaid" | "partially_paid" | "paid_in_full"

interface ProjectPaymentSummary {
  paidAmount: number
  billingState: BillingState
}

function sumActivePayments(payments: Doc<"payments">[]) {
  return payments.reduce((sum, payment) => {
    if (payment.paymentStatus === "refunded") {
      return sum
    }

    return sum + payment.amount
  }, 0)
}

function getLatestActivePaymentDate(payments: Doc<"payments">[]) {
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

  if (paidAmount <= 0) {
    return {
      paidAmount: 0,
      billingState: "unpaid",
    }
  }

  if (paidAmount >= project.price) {
    return {
      paidAmount,
      billingState: "paid_in_full",
    }
  }

  return {
    paidAmount,
    billingState: "partially_paid",
  }
}

export async function syncBillingSummary(
  ctx: MutationCtx,
  clientId: Id<"clients">
) {
  const existingSummary = await ctx.db
    .query("clientBillingSummaries")
    .withIndex("by_client", (q) => q.eq("clientId", clientId))
    .first()
  const client = await ctx.db.get(clientId)

  if (!client) {
    if (existingSummary) {
      await ctx.db.delete(existingSummary._id)
    }
    return
  }

  const [projects, payments] = await Promise.all([
    ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .collect(),
    ctx.db
      .query("payments")
      .withIndex("by_client", (q) => q.eq("clientId", clientId))
      .collect(),
  ])

  if (projects.length === 0) {
    if (existingSummary) {
      await ctx.db.delete(existingSummary._id)
    }
    return
  }

  const projectIds = new Set(projects.map((project) => project._id))
  const scopedPayments = payments.filter((payment) =>
    projectIds.has(payment.projectId)
  )

  const totalProjectValue = projects.reduce(
    (sum, project) => sum + project.price,
    0
  )
  const totalPaid = sumActivePayments(scopedPayments)
  const outstandingBalance = Math.max(totalProjectValue - totalPaid, 0)
  const lastPaymentAt = getLatestActivePaymentDate(scopedPayments)

  let completedProjects = 0
  let ongoingProjects = 0
  let paidProjects = 0
  let partiallyPaidProjects = 0
  let unpaidProjects = 0

  for (const project of projects) {
    const projectPayments = scopedPayments.filter(
      (payment) => payment.projectId === project._id
    )
    const projectSummary = buildProjectPaymentSummary(project, projectPayments)

    if (project.status === "delivered") {
      completedProjects += 1
    } else if (project.status !== "cancelled") {
      ongoingProjects += 1
    }

    if (projectSummary.billingState === "paid_in_full") {
      paidProjects += 1
      continue
    }

    if (projectSummary.billingState === "partially_paid") {
      partiallyPaidProjects += 1
      continue
    }

    unpaidProjects += 1
  }

  const billingState: BillingState =
    outstandingBalance <= 0 && totalProjectValue > 0
      ? "paid_in_full"
      : totalPaid <= 0
        ? "unpaid"
        : "partially_paid"

  const summaryValue = {
    clientId,
    companyName: client.companyName,
    totalProjectValue,
    totalPaid,
    outstandingBalance,
    hasOutstandingBalance: outstandingBalance > 0,
    totalProjects: projects.length,
    completedProjects,
    ongoingProjects,
    paidProjects,
    partiallyPaidProjects,
    unpaidProjects,
    lastPaymentAt,
    billingState,
    updatedAt: Date.now(),
  }

  if (existingSummary) {
    await ctx.db.patch(existingSummary._id, summaryValue)
    return
  }

  await ctx.db.insert("clientBillingSummaries", summaryValue)
}
