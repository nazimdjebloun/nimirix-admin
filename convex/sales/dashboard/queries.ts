import { v } from "convex/values";
import { query } from "@/convex/_generated/server";
import { requireRoles, getUserById } from "@/convex/users";
import { paginationOptsValidator } from "convex/server";
import { authComponent } from "@/convex/auth";

/**
 * Get prospects with pagination and search.
 */
export const getProspectsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("prospect"),
      v.literal("initial_contact"),
      v.literal("negotiation"),
      v.literal("verbal_agreement"),
      v.literal("converted"),
      v.literal("lost"),
      v.literal("out_of_target")
    )),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
    sortBy: v.optional(v.union(v.literal("createdAt"), v.literal("updatedAt"))),
  },
  handler: async (ctx, args) => {
   const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    let results;
    const order = args.sortOrder === "oldest" ? "asc" : "desc";
    const sortBy = args.sortBy || "updatedAt";

    if (args.search) {
      results = await ctx.db
        .query("clients")
        .withSearchIndex("search_company", (q) =>
          q.search("companyName", args.search!)
        )
        .paginate(args.paginationOpts);
      
      // Filter search results after pagination
      results.page = results.page.filter(c => {
        if (c.salesPersonId !== user._id) return false;
        if (args.status) return c.status === args.status;
        return c.status !== "converted";
      });
    } else {
      const queryBody = ctx.db.query("clients");

      const requestedStatus = args.status;
      if (requestedStatus) {
        const indexName = sortBy === "createdAt" ? "by_status_created" : "by_status_updated";
        results = await queryBody
          .withIndex(indexName, (q) => q.eq("status", requestedStatus!))
          .filter((q) => q.eq(q.field("salesPersonId"), user._id))
          .order(order)
          .paginate(args.paginationOpts);
      } else {
        // Default global query (excluding converted)
        results = await queryBody
          .withIndex("by_status")
          .filter((q) => q.and(
            q.neq(q.field("status"), "converted"),
            q.eq(q.field("salesPersonId"), user._id)
          ))
          .order(order)
          .paginate(args.paginationOpts);
      }
    }

    const page = await Promise.all(
      results.page.map(async (client) => {
        const salesPerson = client.salesPersonId 
          ? await getUserById(ctx, client.salesPersonId) 
          : null;
        
        const lastStatusLog = await ctx.db
          .query("clientStatusLog")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .order("desc")
          .first();

        return {
          ...client,
          salesPerson: salesPerson ? {
            _id: salesPerson._id as string,
            name: salesPerson.name as string,
            email: salesPerson.email as string,
          } : null,
          lastStatusChange: lastStatusLog ? {
            createdAt: lastStatusLog.createdAt,
            newStatus: lastStatusLog.newStatus
          } : null,
        };
      })
    );

    return { ...results, page };
  },
});


/**
 * Stats for the dashboard (counts and monthly figures).
 */
export const getDashboardStats = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    
    const allMyLeads = await ctx.db
      .query("clients")
      .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
      .collect();

    const pipelineCounts = {
      prospect: 0,
      initial_contact: 0,
      negotiation: 0,
      verbal_agreement: 0,
    };

    allMyLeads.forEach(c => {
      if (c.status in pipelineCounts) {
        pipelineCounts[c.status as keyof typeof pipelineCounts]++;
      }
    });

    const thirtyDaysAgo = args.currentTime - 30 * 24 * 60 * 60 * 1000;

    return {
      pipeline: pipelineCounts,
      stats: {
        totalActive: allMyLeads.filter(c => c.status !== "converted" && c.status !== "lost" && c.status !== "out_of_target").length,
        allTimeConversions: allMyLeads.filter(c => c.status === "converted").length,
        allTimeLost: allMyLeads.filter(c => c.status === "lost").length,
        conversionsThisMonth: allMyLeads.filter(c => c.status === "converted" && (c.updatedAt ?? 0) >= thirtyDaysAgo).length,
        lostThisMonth: allMyLeads.filter(c => c.status === "lost" && (c.updatedAt ?? 0) >= thirtyDaysAgo).length
      }
    };
  },
});




export const getClientCrmDetails = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const client = await ctx.db.get(args.clientId);
    if (!client) return null;

    // Salesperson info
    const salesPerson = client.salesPersonId
      ? await getUserById(ctx, client.salesPersonId)
      : null;

    // All interactions for this client
    const interactions = await ctx.db
      .query("clientInteractions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    // Interaction stats
    const interactionStats = {
      totalCalls: interactions.filter((i) => i.type === "call").length,
      totalEmails: interactions.filter((i) => i.type === "email").length,
      completedCalls: interactions.filter((i) => i.type === "call" && i.status === "completed").length,
      completedEmails: interactions.filter((i) => i.type === "email" && i.status === "completed").length,
      missedCalls: interactions.filter((i) => i.type === "call" && i.status === "missed").length,
      missedEmails: interactions.filter((i) => i.type === "email" && i.status === "missed").length,
      noResponseCalls: interactions.filter((i) => i.type === "call" && i.status === "no_response").length,
      noResponseEmails: interactions.filter((i) => i.type === "email" && i.status === "no_response").length,
      scheduledCalls: interactions.filter((i) => i.type === "call" && i.status === "scheduled").length,
      scheduledEmails: interactions.filter((i) => i.type === "email" && i.status === "scheduled").length,
    };

    // Last interaction (most recent)
    const lastInteraction = interactions[0] ?? null;

    // All meetings for this client
    const meetings = await ctx.db
      .query("clientMeetings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    // Meeting stats
    const meetingStats = {
      total: meetings.length,
      completed: meetings.filter((m) => m.status === "completed").length,
      scheduled: meetings.filter((m) => m.status === "scheduled").length,
      missed: meetings.filter((m) => m.status === "missed").length,
      cancelled: meetings.filter((m) => m.status === "cancelled").length,
    };

    // Last meeting
    const lastMeeting = meetings[0] ?? null;

    // Status change log with user names
    const statusLogs = await ctx.db
      .query("clientStatusLog")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    const statusLogsWithUser = await Promise.all(
      statusLogs.map(async (log) => {
        const u = await getUserById(ctx, log.userId);
        return {
          ...log,
          userName: u ? u.name : "unknown",
        };
      })
    );

    return {
      client,
      salesPerson: salesPerson
        ? { name: salesPerson.name }
        : null,
      interactionStats,
      lastInteraction,
      meetingStats,
      lastMeeting,
      statusLog: statusLogsWithUser,
    };
  },
});

/**
 * Fetch data for Sales Goals Progress and the Team Monthly Leaderboard.
 */
export const getLeaderboardAndGoals = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    // Calculate time metrics for today (start of day)
    const todayDate = new Date(args.currentTime);
    todayDate.setHours(0, 0, 0, 0);
    const startOfToday = todayDate.getTime();

    // Calculate time metrics for this month (start of month)
    const monthDate = new Date(args.currentTime);
    monthDate.setDate(1);
    monthDate.setHours(0, 0, 0, 0);
    const startOfMonth = monthDate.getTime();

    // 1. DAILY GOALS PROGRESS (completed calls & meetings today by this user)
    const todayInteractions = await ctx.db
      .query("clientInteractions")
      .withIndex("by_user_and_scheduled", (q) =>
        q.eq("userId", user._id).gte("scheduledAt", startOfToday)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const todayMeetings = await ctx.db
      .query("clientMeetings")
      .withIndex("by_user_and_scheduled", (q) =>
        q.eq("userId", user._id).gte("scheduledAt", startOfToday)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const completedToday = todayInteractions.length + todayMeetings.length;
    const dailyGoalTarget = 10; // Target 10 completed activities per day

    // 2. MONTHLY CONVERSIONS GOAL (conversions this month by this user)
    const allConversions = await ctx.db
      .query("clients")
      .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
      .filter((q) => q.and(
        q.eq(q.field("status"), "converted"),
        q.gte(q.field("updatedAt"), startOfMonth)
      ))
      .collect();

    const conversionsThisMonth = allConversions.length;
    const monthlyGoalTarget = 5; // Target 5 conversions per month

    // 3. TEAM MONTHLY LEADERBOARD (ranking all sales reps by their conversions this month)
    const convertedClients = await ctx.db
      .query("clients")
      .filter((q) => q.and(
        q.eq(q.field("status"), "converted"),
        q.gte(q.field("updatedAt"), startOfMonth)
      ))
      .collect();

    const conversionsByUser: Record<string, { conversions: number; name: string; email: string }> = {};

    for (const c of convertedClients) {
      if (c.salesPersonId) {
        const uId = c.salesPersonId;
        if (!conversionsByUser[uId]) {
          const u = await getUserById(ctx, uId);
          conversionsByUser[uId] = {
            conversions: 0,
            name: u?.name || "Unknown User",
            email: u?.email || "",
          };
        }
        conversionsByUser[uId].conversions++;
      }
    }

    const leaderboard = Object.entries(conversionsByUser)
      .map(([id, stats]) => ({
        userId: id,
        ...stats,
      }))
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 5);

    return {
      dailyGoals: {
        completed: completedToday,
        target: dailyGoalTarget,
        percentage: Math.min(100, Math.round((completedToday / dailyGoalTarget) * 100)),
      },
      monthlyGoals: {
        completed: conversionsThisMonth,
        target: monthlyGoalTarget,
        percentage: Math.min(100, Math.round((conversionsThisMonth / monthlyGoalTarget) * 100)),
      },
      leaderboard,
    };
  },
});

