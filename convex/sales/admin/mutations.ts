import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireRoles } from "../../users";
import { aggregatePipeline, aggregatePipelineBySalesPerson } from "../aggregates";

/**
 * Owner Reassignment Mutation
 */
export const reassignLead = mutation({
  args: {
    clientId: v.id("clients"),
    newSalesPersonId: v.string(), // Using string because BetterAuth user IDs are strings, not Id<"users">
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const owner = await requireRoles(ctx, ["admin", "leadSales"]);
    const client = await ctx.db.get(args.clientId);
    if (!client) throw new Error("Client not found");

    const now = Date.now();

    await ctx.db.patch(args.clientId, {
      salesPersonId: args.newSalesPersonId,
      updatedAt: now,
    });

    const newDoc = await ctx.db.get(args.clientId);
    await aggregatePipeline.replace(ctx, client, newDoc!);
    await aggregatePipelineBySalesPerson.replace(ctx, client, newDoc!);

    await ctx.db.insert("clientStatusLog", {
      clientId: args.clientId,
      userId: owner._id, // Using owner._id as it's the Id<"user"> that auth returns
      oldStatus: client.status,
      newStatus: client.status,
      isFinalStage: ["converted", "lost", "out_of_target"].includes(client.status),
      notes: `Reassigned from ${client.salesPersonId ?? 'None'} to ${args.newSalesPersonId}. Ref: ${args.notes ?? 'Manual intervention'}`,
      createdAt: now,
    });

    // await ctx.db.insert("crmReminders", {
    //   userId: args.newSalesPersonId,
    //   clientId: args.clientId,
    //   entityType: "client" as any, // HACK: "client" is not in the schema union ("meeting" | "interaction"). If client is intended, schema must be updated. For now, bypass type or change to something valid. Let's cast for now, but user should fix schema.
    //   remindAt: now,
    //   notes: `New lead assigned by Owner! Follow up immediately.`,
    //   isSent: false,
    //   isSeen: false,
    //   createdAt: now,
    // });
  },
});
