import { requireRoles } from "@/convex/users";
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { aggregatePipeline, aggregatePipelineBySalesPerson } from "../aggregates";


/**
 * Updates the CRM status of a client.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("clients"),
    status: v.union(
      v.literal("prospect"),
      v.literal("initial_contact"),
      v.literal("negotiation"),
      v.literal("verbal_agreement"),
      v.literal("converted"),
      v.literal("lost"),
      v.literal("out_of_target")
    ),
    lostReason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales"]);

    // Get current client to capture old status
    const client = await ctx.db.get(args.id);
    if (!client) throw new ConvexError("Client non trouvé");

    const oldStatus = client.status;

    const updates: {
      status: typeof args.status;
      lostReason?: string;
      updatedAt: number;
    } = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "lost") {
      if (args.lostReason) {
        updates.lostReason = args.lostReason;
      }
    } else {
      // If reopening (not lost), clear the lost reason
      updates.lostReason = undefined;
    }

    await ctx.db.patch(args.id, updates);

    const newDoc = await ctx.db.get(args.id);
    await aggregatePipeline.replace(ctx, client, newDoc!);
    await aggregatePipelineBySalesPerson.replace(ctx, client, newDoc!);

    // Log the status change
    await ctx.db.insert("clientStatusLog", {
      clientId: args.id,
      userId: user._id,
      oldStatus,
      newStatus: args.status,
      isFinalStage: ["converted", "lost", "out_of_target"].includes(args.status),
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});