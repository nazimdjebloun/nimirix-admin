import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requireRoles } from "../../users";
import { aggregateInteractionsByUser } from "../aggregates";

export const createInteraction = mutation({
  args: {
    clientId: v.id("clients"),
    type: v.union(v.literal("call"), v.literal("email")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("no_response")
    ),
    scheduledAt: v.optional(v.number()),
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

    // Auto-update client's last interaction if this is completed
    if (args.status === "completed") {
      await ctx.db.patch(args.clientId, {
        lastInteractionAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Transparently merge brief into notes for schema compatibility
    let notes = args.notes;
    if (args.brief) {
      notes = notes ? `${notes}\n\nBrief: ${args.brief}` : `Brief: ${args.brief}`;
    }

    const scheduledAt = args.scheduledAt || args.scheduledAt || Date.now();

    const interactionId = await ctx.db.insert("clientInteractions", {
      clientId: args.clientId,
      userId: user._id,
      type: args.type,
      status: args.status,
      scheduledAt,
      outcome: args.outcome || undefined,
      notes: notes || undefined,
      finishedAt: args.status !== "scheduled" ? Date.now() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const doc = await ctx.db.get(interactionId);
    await aggregateInteractionsByUser.insert(ctx, doc!);

    return interactionId;
  },
});

export const updateInteraction = mutation({
  args: {
    interactionId: v.id("clientInteractions"),
    type: v.optional(v.union(v.literal("call"), v.literal("email"))),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("no_response")
    )),
    scheduledAt: v.optional(v.number()),
    outcome: v.optional(v.union(
      v.literal("positive"),
      v.literal("neutral"),
      v.literal("negative")
    )),
    notes: v.optional(v.string()),
    brief: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const { interactionId, ...updateData } = args;

    const interaction = await ctx.db.get(interactionId);
    if (!interaction) throw new Error("Interaction not found");

    // Auto-update client's last interaction if this becomes completed
    if (args.status === "completed") {
      await ctx.db.patch(interaction.clientId, {
        lastInteractionAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Build the patched notes field merging brief
    let notes = args.notes !== undefined ? args.notes : interaction.notes;
    if (args.brief !== undefined) {
      let notesWithoutBrief = notes || "";
      if (notes) {
        if (notes.startsWith("Brief: ")) {
          notesWithoutBrief = "";
        } else {
          notesWithoutBrief = notes.split("\n\nBrief: ")[0];
        }
      }
      if (args.brief) {
        notes = notesWithoutBrief ? `${notesWithoutBrief}\n\nBrief: ${args.brief}` : `Brief: ${args.brief}`;
      } else {
        notes = notesWithoutBrief || undefined;
      }
    }

    const scheduledAt = args.scheduledAt || args.scheduledAt || interaction.scheduledAt;

    await ctx.db.patch(interactionId, {
      ...(updateData.type && { type: updateData.type }),
      ...(updateData.status && { status: updateData.status }),
      scheduledAt,
      outcome: updateData.outcome || undefined,
      notes: notes || undefined,
      ...(updateData.status && {
        finishedAt: updateData.status !== "scheduled" ? Date.now() : undefined,
      }),
      updatedAt: Date.now(),
    });

    const newDoc = await ctx.db.get(interactionId);
    await aggregateInteractionsByUser.replace(ctx, interaction, newDoc!);
  },
});

export const deleteInteraction = mutation({
  args: {
    interactionId: v.id("clientInteractions"),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const oldDoc = await ctx.db.get(args.interactionId);
    await ctx.db.delete(args.interactionId);
    if (oldDoc) {
      await aggregateInteractionsByUser.delete(ctx, oldDoc);
    }
  },
});
