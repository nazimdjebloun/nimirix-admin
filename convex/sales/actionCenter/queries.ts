import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireRoles, getUserById } from "../../users";
import { Id } from "../../_generated/dataModel";

/**
 * Today's Priorities: Meetings and Reminders.
 */
export const getActionCenterToday = query({
  args: {
    startOfDay: v.number(),
    endOfDay: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    const todayReminders = await ctx.db
      .query("crmReminders")
      .withIndex("by_user_seen_remind_at", (q) => 
        q.eq("userId", user._id).eq("isSeen", false)
      )
      .filter((q) => q.and(
        q.gte(q.field("remindAt"), args.startOfDay),
        q.lte(q.field("remindAt"), args.endOfDay)
      ))
      .collect();

    const todayMeetings = await ctx.db
      .query("clientMeetings")
      .withIndex("by_user_and_scheduled", (q) => 
        q.eq("userId", user._id)
          .gte("scheduledAt", args.startOfDay)
          .lte("scheduledAt", args.endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    const todayInteractions = await ctx.db
      .query("clientInteractions")
      .withIndex("by_user_and_scheduled", (q) =>
        q.eq("userId", user._id)
          .gte("scheduledAt", args.startOfDay)
          .lte("scheduledAt", args.endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "scheduled"))
      .collect();

    return [...todayReminders, ...todayMeetings, ...todayInteractions];
  },
});

/**
 * Upcoming reminders (next 7 days after today).
 */
export const getUpcomingReminders = query({
  args: {
    endOfDay: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    return await ctx.db
      .query("crmReminders")
      .withIndex("by_user_seen_remind_at", (q) => 
        q.eq("userId", user._id).eq("isSeen", false)
      )
      .filter((q) => q.gt(q.field("remindAt"), args.endOfDay))
      .take(10);
  },
});

/**
 * Performance-heavy hygiene checks (Cold, Never Contacted, Stale Verbal).
 */
export const getDashboardHygiene = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    // 1. Cold Prospects (Contacted before, but no interaction in > 7 days)
    const sevenDaysAgo = args.currentTime - (7 * 24 * 60 * 60 * 1000);
    const coldProspects = await ctx.db
      .query("clients")
      .withIndex("by_sales_person_last_interaction", (q) => 
        q.eq("salesPersonId", user._id)
      )
      .filter((q) => q.and(
        q.neq(q.field("lastInteractionAt"), undefined),
        q.lte(q.field("lastInteractionAt"), sevenDaysAgo),
        q.neq(q.field("status"), "converted"),
        q.neq(q.field("status"), "lost"),
        q.neq(q.field("status"), "out_of_target")
      ))
      .take(5);

    // 2. Never Contacted (> 12 hours since creation, zero interactions/meetings)
    const twelveHoursAgo = args.currentTime - (12 * 60 * 60 * 1000);
    const potentialNeverContacted = await ctx.db
      .query("clients")
      .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
      .filter((q) => q.and(
        q.eq(q.field("status"), "prospect"),
        q.eq(q.field("lastInteractionAt"), undefined),
        q.lte(q.field("createdAt"), twelveHoursAgo)
      ))
      .take(20); // Take more to ensure we can find 5 after filtering

    const neverContacted = [];
    for (const client of potentialNeverContacted) {
      const hasInteractions = await ctx.db
        .query("clientInteractions")
        .withIndex("by_client", (q) => q.eq("clientId", client._id))
        .first();
      const hasMeetings = await ctx.db
        .query("clientMeetings")
        .withIndex("by_client", (q) => q.eq("clientId", client._id))
        .first();

      if (!hasInteractions && !hasMeetings) {
        neverContacted.push(client);
        if (neverContacted.length >= 5) break;
      }
    }

    // 3. Stale Verbal Agreements (> 3 days)
    const threeDaysAgo = args.currentTime - (3 * 24 * 60 * 60 * 1000);
    const potentialStaleVerbal = await ctx.db
      .query("clients")
      .withIndex("by_sales_person_status_updated", (q) => 
        q.eq("salesPersonId", user._id).eq("status", "verbal_agreement")
      )
      .collect();

    const staleVerbal = [];
    for (const client of potentialStaleVerbal) {
      // Find the last time this client was moved to verbal_agreement
      const latestVerbalLog = await ctx.db
        .query("clientStatusLog")
        .withIndex("by_client", (q) => q.eq("clientId", client._id))
        .filter((q) => q.eq(q.field("newStatus"), "verbal_agreement"))
        .order("desc")
        .first();

      // If no log found (e.g. client was created with that status), fall back to createdAt
      const enteredStatusAt = latestVerbalLog?.createdAt ?? client.createdAt;

      if (enteredStatusAt <= threeDaysAgo) {
        staleVerbal.push(client);
        if (staleVerbal.length >= 5) break;
      }
    }

    // 4. Hot List (High Priority)
    // 1. Closing deals: Negotiation/Verbal Agreement updated recently
    const closingDeals = await ctx.db
      .query("clients")
      .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
      .filter((q) => q.and(
        q.or(
          q.eq(q.field("status"), "negotiation"),
          q.eq(q.field("status"), "verbal_agreement")
        ),
        q.gte(q.field("updatedAt"), threeDaysAgo)
      ))
      .collect();

    // 2. High Engagement: Interacted with in last 48h (excluding those already found)
    const twoDaysAgo = args.currentTime - (2 * 24 * 60 * 60 * 1000); // 48h
    const recentInteractions = await ctx.db
      .query("clients")
      .withIndex("by_sales_person_last_interaction", (q) =>
        q.eq("salesPersonId", user._id)
      )
      .filter((q) => q.and(
        q.gte(q.field("lastInteractionAt"), twoDaysAgo),
        q.neq(q.field("status"), "converted"),
        q.neq(q.field("status"), "lost")
      ))
      .take(10);

    // Merge and deduplicate
    const dealIds = new Set(closingDeals.map(c => c._id));
    const hotList = [...closingDeals];

    for (const client of recentInteractions) {
      if (!dealIds.has(client._id)) {
        hotList.push(client);
      }
    }

    return {
      cold: coldProspects,
      neverContacted: neverContacted,
      staleVerbal: staleVerbal,
      hotList: hotList.slice(0, 10),
    };
  },
});

/**
 * CRM Hygiene & "Leaking Lead" Alerts:
 * Highlights leads that have been in the pipeline for over 14 days with zero interactions or meetings,
 * or in negotiation/initial_contact/verbal_agreement for over 10 days without any contact.
 */
export const getCrmHygieneAlerts = query({
  args: {
    currentTime: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    const activeClients = await ctx.db
      .query("clients")
      .withIndex("by_sales_person", (q) => q.eq("salesPersonId", user._id))
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.neq(q.field("status"), "converted"),
        q.neq(q.field("status"), "lost"),
        q.neq(q.field("status"), "out_of_target")
      ))
      .collect();

    const alerts: Array<{
      id: string;
      client: {
        id: Id<"clients">;
        companyName: string;
        status: string;
      };
      type: "stale_lead" | "leaking_lead";
      days: number;
      message: string;
      actionType: "call" | "meeting";
    }> = [];
    const fourteenDaysAgo = args.currentTime - (14 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = args.currentTime - (10 * 24 * 60 * 60 * 1000);

    for (const client of activeClients) {
      // Fetch interactions
      const interactions = await ctx.db
        .query("clientInteractions")
        .withIndex("by_client", (q) => q.eq("clientId", client._id))
        .collect();

      // Fetch meetings
      const meetings = await ctx.db
        .query("clientMeetings")
        .withIndex("by_client", (q) => q.eq("clientId", client._id))
        .collect();

      const totalContacts = interactions.length + meetings.length;

      // 1. Stale Lead Alert: over 14 days in pipeline with zero recorded interactions or meetings
      if (client.createdAt <= fourteenDaysAgo && totalContacts === 0) {
        const days = Math.floor((args.currentTime - client.createdAt) / (24 * 60 * 60 * 1000));
        alerts.push({
          id: `stale-${client._id}`,
          client: {
            id: client._id,
            companyName: client.companyName,
            status: client.status,
          },
          type: "stale_lead",
          days,
          message: `${client.companyName} has been in the pipeline for ${days} days with zero recorded interactions or meetings.`,
          actionType: "call" as const,
        });
        continue; // Skip leaking lead check if it's already stale
      }

      // 2. Leaking Lead Alert: in negotiation, initial_contact or verbal_agreement for over 10 days without contact
      const lastContactAt = Math.max(
        client.lastInteractionAt || 0,
        ...meetings.map(m => m.scheduledAt),
        ...interactions.map(i => i.scheduledAt),
        client.createdAt
      );

      if (lastContactAt <= tenDaysAgo) {
        const days = Math.floor((args.currentTime - lastContactAt) / (24 * 60 * 60 * 1000));
        let actionType: "call" | "meeting" = "call";
        if (client.status === "negotiation" || client.status === "verbal_agreement") {
          actionType = "meeting";
        }
        
        const statusLabels: Record<string, string> = {
          prospect: "Prospect",
          initial_contact: "Initial Contact",
          negotiation: "Negotiation",
          verbal_agreement: "Verbal Agreement",
        };
        const statusLabel = statusLabels[client.status] || client.status;

        alerts.push({
          id: `leaking-${client._id}`,
          client: {
            id: client._id,
            companyName: client.companyName,
            status: client.status,
          },
          type: "leaking_lead",
          days,
          message: `${client.companyName} has been in '${statusLabel}' for ${days} days without any contact.`,
          actionType,
        });
      }
    }

    return alerts;
  },
});

/**
 * Unified Activity Feed / Timeline for a specific Client:
 * Merges meetings and interactions (calls/emails), handles filtering by type,
 * sorts by timestamp descending, resolves the creator's name, and supports pagination.
 */
export const getClientTimeline = query({
  args: {
    clientId: v.id("clients"),
    limit: v.number(),
    filterType: v.union(v.literal("all"), v.literal("interaction"), v.literal("meeting")),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    interface TimelineItem {
      id: string;
      type: "meeting" | "interaction";
      subType: string;
      timestamp: number;
      createdAt: number;
      scheduledAt?: number;
      finishedAt?: number;
      status: string;
      notes?: string;
      outcome?: string;
      creatorName: string;
    }

    const timelineItems: TimelineItem[] = [];

    // Fetch meetings if filter is 'all' or 'meeting'
    if (args.filterType === "all" || args.filterType === "meeting") {
      const meetings = await ctx.db
        .query("clientMeetings")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect();

      for (const m of meetings) {
        // Safe user retrieval via getUserById helper
        let creatorName = "Unknown";
        if (m.userId) {
          const u = await getUserById(ctx, m.userId);
          if (u && typeof u === "object" && "name" in u) {
            creatorName = (u as { name: string }).name;
          }
        }
        timelineItems.push({
          id: `meeting-${m._id}`,
          type: "meeting",
          subType: m.type,
          timestamp: m.scheduledAt,
          createdAt: m.createdAt,
          scheduledAt: m.scheduledAt,
          finishedAt: m.finishedAt,
          status: m.status,
          notes: m.notes,
          outcome: m.outcome,
          creatorName,
        });
      }
    }

    // Fetch interactions if filter is 'all' or 'interaction'
    if (args.filterType === "all" || args.filterType === "interaction") {
      const interactions = await ctx.db
        .query("clientInteractions")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
        .collect();

      for (const i of interactions) {
        // Safe user retrieval via getUserById helper
        let creatorName = "Unknown";
        if (i.userId) {
          const u = await getUserById(ctx, i.userId);
          if (u && typeof u === "object" && "name" in u) {
            creatorName = (u as { name: string }).name;
          }
        }
        timelineItems.push({
          id: `interaction-${i._id}`,
          type: "interaction",
          subType: i.type,
          timestamp: i.scheduledAt,
          createdAt: i.createdAt,
          scheduledAt: i.scheduledAt,
          finishedAt: i.finishedAt,
          status: i.status,
          notes: i.notes,
          outcome: i.outcome,
          creatorName,
        });
      }
    }

    // Sort by timestamp descending (most recent first)
    timelineItems.sort((a, b) => b.timestamp - a.timestamp);

    const paginatedItems = timelineItems.slice(0, args.limit);
    const hasMore = timelineItems.length > args.limit;

    return {
      items: paginatedItems,
      hasMore,
      totalCount: timelineItems.length,
    };
  },
});


