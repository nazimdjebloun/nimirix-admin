import { v } from "convex/values"
import { query } from "@/convex/_generated/server"
import { requireRoles, getUserById } from "@/convex/users"
import { paginationOptsValidator } from "convex/server"
import { authComponent } from "@/convex/auth"
import { aggregatePipelineBySalesPerson, statusToKey } from "../aggregates"

/**
 * Get prospects with pagination and search.
 */
export const getProspectsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("prospect"),
        v.literal("initial_contact"),
        v.literal("negotiation"),
        v.literal("verbal_agreement"),
        v.literal("converted"),
        v.literal("lost"),
        v.literal("out_of_target")
      )
    ),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
    sortBy: v.optional(v.union(v.literal("createdAt"), v.literal("updatedAt"))),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"])
    let results
    const order = args.sortOrder === "oldest" ? "asc" : "desc"
    const sortBy = args.sortBy || "updatedAt"

    if (args.search) {
      results = await ctx.db
        .query("clients")
        .withSearchIndex("search_company", (q) =>
          q.search("companyName", args.search!)
        )
        .paginate(args.paginationOpts)

      // Filter search results after pagination
      results.page = results.page.filter((c) => {
        if (c.salesPersonId !== user._id) return false
        if (args.status) return c.status === args.status
        return c.status !== "converted"
      })
    } else {
      const queryBody = ctx.db.query("clients")

      const requestedStatus = args.status
      if (requestedStatus) {
        const indexName =
          sortBy === "createdAt" ? "by_status_created" : "by_status_updated"
        results = await queryBody
          .withIndex(indexName, (q) => q.eq("status", requestedStatus!))
          .filter((q) => q.eq(q.field("salesPersonId"), user._id))
          .order(order)
          .paginate(args.paginationOpts)
      } else {
        // Default global query (excluding converted)
        results = await queryBody
          .withIndex("by_status")
          .filter((q) =>
            q.and(
              q.neq(q.field("status"), "converted"),
              q.eq(q.field("salesPersonId"), user._id)
            )
          )
          .order(order)
          .paginate(args.paginationOpts)
      }
    }

    const page = await Promise.all(
      results.page.map(async (client) => {
        const salesPerson = client.salesPersonId
          ? await getUserById(ctx, client.salesPersonId)
          : null

        const lastStatusLog = await ctx.db
          .query("clientStatusLog")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .order("desc")
          .first()

        return {
          ...client,
          salesPerson: salesPerson
            ? {
                _id: salesPerson._id as string,
                name: salesPerson.name as string,
                email: salesPerson.email as string,
              }
            : null,
          lastStatusChange: lastStatusLog
            ? {
                createdAt: lastStatusLog.createdAt,
                newStatus: lastStatusLog.newStatus,
              }
            : null,
        }
      })
    )

    return { ...results, page }
  },
})

/**
 * Stats for the dashboard (counts and monthly figures).
 */
export const getDashboardStats = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"])

    const namespace = user._id
    const activeStatuses = [
      "prospect",
      "initial_contact",
      "negotiation",
      "verbal_agreement",
    ] as const

    const pipeline: Record<string, number> = {}
    for (const status of activeStatuses) {
      pipeline[status] = await aggregatePipelineBySalesPerson.count(ctx, {
        namespace,
        bounds: {
          lower: { key: [statusToKey(status), ""], inclusive: true },
          upper: { key: [statusToKey(status), "\uffff"], inclusive: true },
        },
      })
    }

    const totalActive = (
      await Promise.all(
        activeStatuses.map((s) =>
          aggregatePipelineBySalesPerson.count(ctx, {
            namespace,
            bounds: {
              lower: { key: [statusToKey(s), ""], inclusive: true },
              upper: { key: [statusToKey(s), "\uffff"], inclusive: true },
            },
          })
        )
      )
    ).reduce((a, b) => a + b, 0)

    const allTimeConversions = await aggregatePipelineBySalesPerson.count(ctx, {
      namespace,
      bounds: {
        lower: { key: [statusToKey("converted"), ""], inclusive: true },
        upper: { key: [statusToKey("converted"), "\uffff"], inclusive: true },
      },
    })

    const allTimeLost = await aggregatePipelineBySalesPerson.count(ctx, {
      namespace,
      bounds: {
        lower: { key: [statusToKey("lost"), ""], inclusive: true },
        upper: { key: [statusToKey("lost"), "\uffff"], inclusive: true },
      },
    })

    const thirtyDaysAgo = args.currentTime - 30 * 24 * 60 * 60 * 1000

    const recentConverted = await ctx.db
      .query("clients")
      .withIndex("by_sales_person_status_updated", (q) =>
        q
          .eq("salesPersonId", user._id)
          .eq("status", "converted")
          .gte("updatedAt", thirtyDaysAgo)
      )
      .take(500)

    const recentLost = await ctx.db
      .query("clients")
      .withIndex("by_sales_person_status_updated", (q) =>
        q
          .eq("salesPersonId", user._id)
          .eq("status", "lost")
          .gte("updatedAt", thirtyDaysAgo)
      )
      .take(500)

    return {
      pipeline,
      stats: {
        totalActive,
        allTimeConversions,
        allTimeLost,
        conversionsThisMonth: recentConverted.length,
        lostThisMonth: recentLost.length,
      },
    }
  },
})

export const getClientCrmDetails = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx)
    if (!user) {
      throw new Error("Unauthorized")
    }

    const client = await ctx.db.get(args.clientId)
    if (!client) return null

    // Salesperson info
    const salesPerson = client.salesPersonId
      ? await getUserById(ctx, client.salesPersonId)
      : null

    // All interactions for this client
    const interactions = await ctx.db
      .query("clientInteractions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect()

    // Interaction stats
    const interactionStats = {
      totalCalls: interactions.filter((i) => i.type === "call").length,
      totalEmails: interactions.filter((i) => i.type === "email").length,
      completedCalls: interactions.filter(
        (i) => i.type === "call" && i.status === "completed"
      ).length,
      completedEmails: interactions.filter(
        (i) => i.type === "email" && i.status === "completed"
      ).length,
      missedCalls: interactions.filter(
        (i) => i.type === "call" && i.status === "missed"
      ).length,
      missedEmails: interactions.filter(
        (i) => i.type === "email" && i.status === "missed"
      ).length,
      noResponseCalls: interactions.filter(
        (i) => i.type === "call" && i.status === "no_response"
      ).length,
      noResponseEmails: interactions.filter(
        (i) => i.type === "email" && i.status === "no_response"
      ).length,
      scheduledCalls: interactions.filter(
        (i) => i.type === "call" && i.status === "scheduled"
      ).length,
      scheduledEmails: interactions.filter(
        (i) => i.type === "email" && i.status === "scheduled"
      ).length,
    }

    // Last interaction (most recent)
    const lastInteraction = interactions[0] ?? null

    // All meetings for this client
    const meetings = await ctx.db
      .query("clientMeetings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect()

    // Meeting stats
    const meetingStats = {
      total: meetings.length,
      completed: meetings.filter((m) => m.status === "completed").length,
      scheduled: meetings.filter((m) => m.status === "scheduled").length,
      missed: meetings.filter((m) => m.status === "missed").length,
      cancelled: meetings.filter((m) => m.status === "cancelled").length,
    }

    // Last meeting
    const lastMeeting = meetings[0] ?? null

    // Status change log with user names
    const statusLogs = await ctx.db
      .query("clientStatusLog")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect()

    const statusLogsWithUser = await Promise.all(
      statusLogs.map(async (log) => {
        const u = await getUserById(ctx, log.userId)
        return {
          ...log,
          userName: u ? u.name : "unknown",
        }
      })
    )

    return {
      client,
      salesPerson: salesPerson ? { name: salesPerson.name } : null,
      interactionStats,
      lastInteraction,
      meetingStats,
      lastMeeting,
      statusLog: statusLogsWithUser,
    }
  },
})

/**
 * Fetch data for Sales Goals Progress and the Team Monthly Leaderboard.
 */
export const getLeaderboardAndGoals = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"])

    const todayDate = new Date(args.currentTime)
    todayDate.setHours(0, 0, 0, 0)
    const startOfToday = todayDate.getTime()

    const monthDate = new Date(args.currentTime)
    monthDate.setDate(1)
    monthDate.setHours(0, 0, 0, 0)
    const startOfMonth = monthDate.getTime()

    const [todayInteractions, todayMeetings, allConversions] =
      await Promise.all([
        ctx.db
          .query("clientInteractions")
          .withIndex("by_user_and_scheduled", (q) =>
            q.eq("userId", user._id).gte("scheduledAt", startOfToday)
          )
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect(),
        ctx.db
          .query("clientMeetings")
          .withIndex("by_user_and_scheduled", (q) =>
            q.eq("userId", user._id).gte("scheduledAt", startOfToday)
          )
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect(),
        ctx.db
          .query("clients")
          .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("status"), "converted"),
              q.gte(q.field("updatedAt"), startOfMonth)
            )
          )
          .collect(),
      ])

    return {
      dailyGoals: {
        completed: todayInteractions.length + todayMeetings.length,
        target: 10,
        percentage: Math.min(
          100,
          Math.round(
            ((todayInteractions.length + todayMeetings.length) / 10) * 100
          )
        ),
      },
      monthlyGoals: {
        completed: allConversions.length,
        target: 5,
        percentage: Math.min(
          100,
          Math.round((allConversions.length / 5) * 100)
        ),
      },
    }
  },
})
