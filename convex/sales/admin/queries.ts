import { query } from "../../_generated/server"
import { v } from "convex/values"
import { paginationOptsValidator } from "convex/server"
import { requireRoles, getUserById } from "../../users"
import { components } from "../../_generated/api"
import {
  aggregatePipeline,
  aggregatePipelineBySalesPerson,
  aggregateInteractionsByUser,
  aggregateMeetingsByUser,
  statusToKey,
} from "../aggregates"
import { Doc } from "@/convex/betterAuth/_generated/dataModel"

/**
 * Global Admin Dashboard Data
 */
export const getAdminDashboardData = query({
  args: { currentTime: v.number() },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    const allStatuses = [
      "prospect",
      "initial_contact",
      "negotiation",
      "verbal_agreement",
      "converted",
      "lost",
      "out_of_target",
    ] as const

    const pipelineCounts = await Promise.all(
      allStatuses.map((status) =>
        aggregatePipeline.count(ctx, {
          bounds: {
            lower: { key: [statusToKey(status), ""], inclusive: true },
            upper: { key: [statusToKey(status), "\uffff"], inclusive: true },
          },
        })
      )
    )

    const pipeline = {
      prospect: pipelineCounts[0],
      initial_contact: pipelineCounts[1],
      negotiation: pipelineCounts[2],
      verbal_agreement: pipelineCounts[3],
      converted: pipelineCounts[4],
      lost: pipelineCounts[5],
      out_of_target: pipelineCounts[6],
    }

    const fortyEightHoursAgo = args.currentTime - 48 * 60 * 60 * 1000
    const sevenDaysAgo = args.currentTime - 7 * 24 * 60 * 60 * 1000
    const activeStatuses = [
      "prospect",
      "initial_contact",
      "negotiation",
      "verbal_agreement",
    ] as const

    // 1. Unassigned: Fetch active unassigned leads directly using the sales person aggregate under '__unassigned__' namespace
    const unassignedItems = await aggregatePipelineBySalesPerson.paginate(ctx, {
      namespace: "__unassigned__",
      bounds: {
        lower: { key: [statusToKey("prospect"), ""], inclusive: true },
        upper: {
          key: [statusToKey("verbal_agreement"), "\uffff"],
          inclusive: true,
        },
      },
      pageSize: 10,
    })

    const unassigned = (
      await Promise.all(unassignedItems.page.map((item) => ctx.db.get(item.id)))
    ).filter((doc): doc is NonNullable<typeof doc> => doc !== null)

    // 2. Stagnant: Fetch active leads where updatedAt < 7 days ago using the index 'by_status_active_updated'
    const stagnantListResults = await Promise.all(
      activeStatuses.map((status) =>
        ctx.db
          .query("clients")
          .withIndex("by_status_active_updated", (q) =>
            q
              .eq("status", status)
              .eq("isActive", true)
              .lt("updatedAt", sevenDaysAgo)
          )
          .take(10)
      )
    )

    const stagnant = stagnantListResults
      .flat()
      .sort((a, b) => a.updatedAt - b.updatedAt)
      .slice(0, 10)

    // 3. Ghosted: Fetch active leads where lastInteractionAt < 48 hours ago using the index 'by_status_active_last_interaction'
    const ghostedListResults = await Promise.all(
      activeStatuses.map((status) =>
        ctx.db
          .query("clients")
          .withIndex("by_status_active_last_interaction", (q) =>
            q
              .eq("status", status)
              .eq("isActive", true)
              .lt("lastInteractionAt", fortyEightHoursAgo)
          )
          .take(10)
      )
    )

    const ghosted = ghostedListResults
      .flat()
      .sort(
        (a, b) =>
          (a.lastInteractionAt ?? Infinity) - (b.lastInteractionAt ?? Infinity)
      )
      .slice(0, 10)

    return {
      pipeline,
      redFlags: {
        ghosted,
        stagnant,
        unassigned,
      },
    }
  },
})

/**
 * Interactions Feed (Calls & Emails)
 */
export const getAdminInteractionsFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchRep: v.optional(v.string()),
    searchClient: v.optional(v.string()),
    statusFilter: v.optional(v.string()), // scheduled, completed, missed, no_response
    typeFilter: v.optional(v.string()), // call, email
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    const statusActive = args.statusFilter && args.statusFilter !== "all"
    const typeActive = args.typeFilter && args.typeFilter !== "all"

    type InteractionStatus =
      | "scheduled"
      | "completed"
      | "missed"
      | "no_response"
    type InteractionType = "call" | "email"

    // Apply field filters at the DB level before paginating
    let result
    if (statusActive && typeActive) {
      result = await ctx.db
        .query("clientInteractions")
        .withIndex("by_status", (q) =>
          q.eq("status", args.statusFilter as InteractionStatus)
        )
        .filter((q) =>
          q.eq(q.field("type"), args.typeFilter as InteractionType)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else if (statusActive) {
      result = await ctx.db
        .query("clientInteractions")
        .withIndex("by_status", (q) =>
          q.eq("status", args.statusFilter as InteractionStatus)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else if (typeActive) {
      result = await ctx.db
        .query("clientInteractions")
        .withIndex("by_type", (q) =>
          q.eq("type", args.typeFilter as InteractionType)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else {
      result = await ctx.db
        .query("clientInteractions")
        .order("desc")
        .paginate(args.paginationOpts)
    }

    // Batch-fetch unique users and clients — eliminates N+1 per page
    const uniqueUserIds = [...new Set(result.page.map((i) => i.userId))]
    const uniqueClientIds = [...new Set(result.page.map((i) => i.clientId))]

    const [fetchedUsers, fetchedClients] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => getUserById(ctx, id))),
      Promise.all(uniqueClientIds.map((id) => ctx.db.get(id))),
    ])

    const userMap = new Map(
      fetchedUsers.map((u, idx) => [uniqueUserIds[idx], u])
    )
    const clientMap = new Map(
      fetchedClients.map((c, idx) => [uniqueClientIds[idx] as string, c])
    )

    const enriched = result.page.map((item) => {
      const user = userMap.get(item.userId)
      const client = clientMap.get(item.clientId)
      return {
        ...item,
        userName:
          user && typeof user === "object" && "name" in user
            ? user.name
            : "Inconnu",
        clientName: client?.companyName ?? "Client Inconnu",
      }
    })

    // Name searches require enrichment — unavoidably post-pagination
    let filtered = enriched
    if (args.searchRep) {
      const s = args.searchRep.toLowerCase()
      filtered = filtered.filter((i) =>
        (i.userName as string).toLowerCase().includes(s)
      )
    }
    if (args.searchClient) {
      const s = args.searchClient.toLowerCase()
      filtered = filtered.filter((i) => i.clientName.toLowerCase().includes(s))
    }

    return { ...result, page: filtered }
  },
})

/**
 * Meetings Feed
 */
export const getAdminMeetingsFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchRep: v.optional(v.string()),
    searchClient: v.optional(v.string()),
    statusFilter: v.optional(v.string()), // scheduled, completed, missed, cancelled
    typeFilter: v.optional(v.string()), // in_office, remote, client_office
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    const statusActive = args.statusFilter && args.statusFilter !== "all"
    const typeActive = args.typeFilter && args.typeFilter !== "all"

    type MeetingStatus = "scheduled" | "completed" | "missed" | "cancelled"
    type MeetingType = "in_office" | "remote" | "client_office"

    // Apply field filters at the DB level before paginating
    let result
    if (statusActive && typeActive) {
      result = await ctx.db
        .query("clientMeetings")
        .withIndex("by_meeting_status", (q) =>
          q.eq("status", args.statusFilter as MeetingStatus)
        )
        .filter((q) => q.eq(q.field("type"), args.typeFilter as MeetingType))
        .order("desc")
        .paginate(args.paginationOpts)
    } else if (statusActive) {
      result = await ctx.db
        .query("clientMeetings")
        .withIndex("by_meeting_status", (q) =>
          q.eq("status", args.statusFilter as MeetingStatus)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else if (typeActive) {
      result = await ctx.db
        .query("clientMeetings")
        .withIndex("by_type", (q) =>
          q.eq("type", args.typeFilter as MeetingType)
        )
        .order("desc")
        .paginate(args.paginationOpts)
    } else {
      result = await ctx.db
        .query("clientMeetings")
        .order("desc")
        .paginate(args.paginationOpts)
    }

    // Batch-fetch unique users and clients — eliminates N+1 per page
    const uniqueUserIds = [...new Set(result.page.map((i) => i.userId))]
    const uniqueClientIds = [...new Set(result.page.map((i) => i.clientId))]

    const [fetchedUsers, fetchedClients] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => getUserById(ctx, id))),
      Promise.all(uniqueClientIds.map((id) => ctx.db.get(id))),
    ])

    const userMap = new Map(
      fetchedUsers.map((u, idx) => [uniqueUserIds[idx], u])
    )
    const clientMap = new Map(
      fetchedClients.map((c, idx) => [uniqueClientIds[idx] as string, c])
    )

    const enriched = result.page.map((item) => {
      const user = userMap.get(item.userId)
      const client = clientMap.get(item.clientId)
      return {
        ...item,
        userName:
          user && typeof user === "object" && "name" in user
            ? user.name
            : "Inconnu",
        clientName: client?.companyName ?? "Client Inconnu",
      }
    })

    // Name searches require enrichment — unavoidably post-pagination
    let filtered = enriched
    if (args.searchRep) {
      const s = args.searchRep.toLowerCase()
      filtered = filtered.filter((i) =>
        (i.userName as string).toLowerCase().includes(s)
      )
    }
    if (args.searchClient) {
      const s = args.searchClient.toLowerCase()
      filtered = filtered.filter((i) => i.clientName.toLowerCase().includes(s))
    }

    return { ...result, page: filtered }
  },
})

/**
 * Status Change Feed (Excludes final stages)
 */
export const getAdminStatusChangeFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchRep: v.optional(v.string()),
    searchClient: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    type NonFinalStatus =
      | "prospect"
      | "initial_contact"
      | "negotiation"
      | "verbal_agreement"

    // When a specific status is selected, use the index directly
    // Otherwise, scan excluding final stages using the fast isFinalStage index
    const result =
      args.statusFilter && args.statusFilter !== "all"
        ? await ctx.db
            .query("clientStatusLog")
            .withIndex("by_new_status", (q) =>
              q.eq("newStatus", args.statusFilter as NonFinalStatus)
            )
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("clientStatusLog")
            .withIndex("by_is_final_stage_created", (q) =>
              q.eq("isFinalStage", false)
            )
            .order("desc")
            .paginate(args.paginationOpts)

    // Batch-fetch unique users and clients — eliminates N+1 per page
    const uniqueUserIds = [...new Set(result.page.map((l) => l.userId))]
    const uniqueClientIds = [...new Set(result.page.map((l) => l.clientId))]

    const [fetchedUsers, fetchedClients] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => getUserById(ctx, id))),
      Promise.all(uniqueClientIds.map((id) => ctx.db.get(id))),
    ])

    const userMap = new Map(
      fetchedUsers.map((u, idx) => [uniqueUserIds[idx], u])
    )
    const clientMap = new Map(
      fetchedClients.map((c, idx) => [uniqueClientIds[idx] as string, c])
    )

    const enriched = result.page.map((log) => {
      const user = userMap.get(log.userId)
      const client = clientMap.get(log.clientId)
      return {
        ...log,
        userName:
          user && typeof user === "object" && "name" in user
            ? user.name
            : "Unknown",
        clientName: client?.companyName ?? "Unknown client",
      }
    })

    // Name searches require enrichment — unavoidably post-pagination
    let filtered = enriched
    if (args.searchRep) {
      const s = args.searchRep.toLowerCase()
      filtered = filtered.filter((i) =>
        (i.userName as string).toLowerCase().includes(s)
      )
    }
    if (args.searchClient) {
      const s = args.searchClient.toLowerCase()
      filtered = filtered.filter((i) => i.clientName.toLowerCase().includes(s))
    }

    return { ...result, page: filtered }
  },
})

/**
 * Conversion Feed (Final Stages only)
 */
export const getAdminConversionFeed = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchRep: v.optional(v.string()),
    searchClient: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    type FinalStatus = "converted" | "lost" | "out_of_target"

    // When a specific final status is selected, use the index directly
    // Otherwise, scan only final stages using the fast isFinalStage index
    const result =
      args.statusFilter && args.statusFilter !== "all"
        ? await ctx.db
            .query("clientStatusLog")
            .withIndex("by_new_status", (q) =>
              q.eq("newStatus", args.statusFilter as FinalStatus)
            )
            .order("desc")
            .paginate(args.paginationOpts)
        : await ctx.db
            .query("clientStatusLog")
            .withIndex("by_is_final_stage_created", (q) =>
              q.eq("isFinalStage", true)
            )
            .order("desc")
            .paginate(args.paginationOpts)

    // Batch-fetch unique users and clients — eliminates N+1 per page
    const uniqueUserIds = [...new Set(result.page.map((l) => l.userId))]
    const uniqueClientIds = [...new Set(result.page.map((l) => l.clientId))]

    const [fetchedUsers, fetchedClients] = await Promise.all([
      Promise.all(uniqueUserIds.map((id) => getUserById(ctx, id))),
      Promise.all(uniqueClientIds.map((id) => ctx.db.get(id))),
    ])

    const userMap = new Map(
      fetchedUsers.map((u, idx) => [uniqueUserIds[idx], u])
    )
    const clientMap = new Map(
      fetchedClients.map((c, idx) => [uniqueClientIds[idx] as string, c])
    )

    const enriched = result.page.map((log) => {
      const user = userMap.get(log.userId)
      const client = clientMap.get(log.clientId)
      return {
        ...log,
        userName:
          user && typeof user === "object" && "name" in user
            ? user.name
            : "Unknown",
        clientName: client?.companyName ?? "Unknown client",
      }
    })

    // Name searches require enrichment — unavoidably post-pagination
    let filtered = enriched
    if (args.searchRep) {
      const s = args.searchRep.toLowerCase()
      filtered = filtered.filter((i) =>
        (i.userName as string).toLowerCase().includes(s)
      )
    }
    if (args.searchClient) {
      const s = args.searchClient.toLowerCase()
      filtered = filtered.filter((i) => i.clientName.toLowerCase().includes(s))
    }

    return { ...result, page: filtered }
  },
})

/**
 * Fetches paginated sales reps performance metrics with name search capability.
 */
export const getPaginatedSalesRepsPerformance = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    const thirtyDaysAgo = args.currentTime - 30 * 24 * 60 * 60 * 1000

    const where: Array<{
      field: string
      operator: "in" | "contains" | "eq"
      value: string | string[]
      connector?: "AND" | "OR"
    }> = [
      { field: "role", operator: "eq", value: "sales" },
      { field: "role", operator: "eq", value: "leadSales" },
    ]

    if (args.search) {
      where.push({
        field: "name",
        operator: "contains",
        value: args.search,
        connector: "AND",
      })
    }

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "user",
      paginationOpts: args.paginationOpts,
      where,
      sortBy: { field: "createdAt", direction: "desc" },
    })

    const enrichedPage = await Promise.all(
      result.page.map(async (rep: Doc<"user">) => {
        const userId = rep._id as string

        // Fetch counts via fast pre-computed aggregate components in parallel
        const activeStatuses = [
          "prospect",
          "initial_contact",
          "negotiation",
          "verbal_agreement",
        ] as const
        const [
          activeLeadsCounts,
          conversionsCount,
          lostCount,
          interactionsCount,
          meetingsCount,
        ] = await Promise.all([
          // 1. Active Leads counts (sum of active statuses)
          Promise.all(
            activeStatuses.map((status) =>
              aggregatePipelineBySalesPerson.count(ctx, {
                namespace: userId,
                bounds: {
                  lower: { key: [statusToKey(status), ""], inclusive: true },
                  upper: {
                    key: [statusToKey(status), "\uffff"],
                    inclusive: true,
                  },
                },
              })
            )
          ),
          // 2. Conversion count
          aggregatePipelineBySalesPerson.count(ctx, {
            namespace: userId,
            bounds: {
              lower: { key: [statusToKey("converted"), ""], inclusive: true },
              upper: {
                key: [statusToKey("converted"), "\uffff"],
                inclusive: true,
              },
            },
          }),
          // 3. Lost count
          aggregatePipelineBySalesPerson.count(ctx, {
            namespace: userId,
            bounds: {
              lower: { key: [statusToKey("lost"), ""], inclusive: true },
              upper: { key: [statusToKey("lost"), "\uffff"], inclusive: true },
            },
          }),
          // 4. Client Interactions count (30d)
          aggregateInteractionsByUser.count(ctx, {
            namespace: userId,
            bounds: { lower: { key: [thirtyDaysAgo, ""], inclusive: true } },
          }),
          // 5. Client Meetings count (30d)
          aggregateMeetingsByUser.count(ctx, {
            namespace: userId,
            bounds: { lower: { key: [thirtyDaysAgo, ""], inclusive: true } },
          }),
        ])

        const activeLeadsCount = activeLeadsCounts.reduce((a, b) => a + b, 0)

        return {
          _id: userId,
          name: rep.name || "Unknown",
          email: rep.email || "",
          activeLeads: activeLeadsCount,
          conversions: conversionsCount,
          lost: lostCount,
          activityCount: interactionsCount + meetingsCount,
          // lastActive: typeof rep.createdAt === "number" ? rep.createdAt : new Date(rep.createdAt || 0).getTime(),
        }
      })
    )

    return {
      ...result,
      page: enrichedPage,
    }
  },
})

export const getAdminProspectsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.union(
      v.literal("prospect"),
      v.literal("initial_contact"),
      v.literal("negotiation"),
      v.literal("verbal_agreement"),
      v.literal("converted"),
      v.literal("lost"),
      v.literal("out_of_target")
    ),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
    sortBy: v.optional(v.union(v.literal("createdAt"), v.literal("updatedAt"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "leadSales"])

    const order = args.sortOrder === "oldest" ? "asc" : "desc"
    const sortBy = args.sortBy || "updatedAt"
    const indexName =
      sortBy === "createdAt" ? "by_status_created" : "by_status_updated"

    let results

    if (args.search) {
      results = await ctx.db
        .query("clients")
        .withSearchIndex("search_company", (q) =>
          q.search("companyName", args.search!)
        )
        .paginate(args.paginationOpts)
      results.page = results.page.filter((c) => c.status === args.status)
    } else {
      results = await ctx.db
        .query("clients")
        .withIndex(indexName, (q) => q.eq("status", args.status))
        .order(order)
        .paginate(args.paginationOpts)
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
