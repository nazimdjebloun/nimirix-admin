import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireRoles } from "../../users";

export const createMeeting = mutation({
  args: {
    clientId: v.id("clients"),
    scheduledAt: v.number(),
    type: v.union(
      v.literal("in_office"),
      v.literal("remote"),
      v.literal("client_office")
    ),
    location: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    ),
    outcome: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    notes: v.optional(v.string()),
    brief: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    const meetingId = await ctx.db.insert("clientMeetings", {
      clientId: args.clientId,
      userId: user._id,
      scheduledAt: args.scheduledAt,
      type: args.type,
      location: args.location || undefined,
      status: args.status,
      outcome: args.outcome || undefined,
      notes: args.notes || undefined,
      brief: args.brief || undefined,
      finishedAt: args.status !== "scheduled" ? Date.now() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return meetingId;
  },
});

export const updateMeeting = mutation({
  args: {
    meetingId: v.id("clientMeetings"),
    scheduledAt: v.number(),
    type: v.union(
      v.literal("in_office"),
      v.literal("remote"),
      v.literal("client_office")
    ),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const { meetingId, ...updateData } = args;
    await ctx.db.patch(meetingId, {
      scheduledAt: updateData.scheduledAt,
      type: updateData.type,
      location: updateData.location || undefined,
      notes: updateData.notes || undefined,
      updatedAt: Date.now(),
    });
  },
});

export const updateMeetingStatus = mutation({
  args: {
    meetingId: v.id("clientMeetings"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    ),
    outcome: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    brief: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    await ctx.db.patch(args.meetingId, {
      status: args.status,
      outcome: args.outcome || undefined,
      brief: args.brief || undefined,
      finishedAt: args.status !== "scheduled" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
  },
});

export const deleteMeeting = mutation({
  args: {
    meetingId: v.id("clientMeetings"),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    await ctx.db.delete(args.meetingId);
  },
});
