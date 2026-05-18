import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireRoles } from "../../users";
import { paginationOptsValidator } from "convex/server";

export const getInteractionsPaginated = query({
  args: {
    clientId: v.optional(v.id("clients")),
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const order = args.sortOrder === "oldest" ? "asc" : "desc";

    let queryBuilder;
    if (args.clientId) {
      queryBuilder = ctx.db.query("clientInteractions")
        .withIndex("by_client", (q) => q.eq("clientId", args.clientId!));
    } else {
      queryBuilder = ctx.db.query("clientInteractions")
        .withIndex("by_user", (q) => q.eq("userId", user._id));
    }

    if (args.status) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("status"), args.status));
    }

    const results = await queryBuilder.order(order).paginate(args.paginationOpts);

    const page = await Promise.all(
      results.page.map(async (interaction) => {
        const client = await ctx.db.get(interaction.clientId);
        
        // Transparently parse brief and scheduledAt for UI compatibility
        let brief: string | undefined = undefined;
        let displayNotes: string | undefined = interaction.notes;
        
        if (interaction.notes) {
          if (interaction.notes.startsWith("Brief: ")) {
            brief = interaction.notes.substring(7);
            displayNotes = undefined;
          } else {
            const parts = interaction.notes.split("\n\nBrief: ");
            if (parts.length > 1) {
              displayNotes = parts[0];
              brief = parts[1];
            }
          }
        }

        return {
          ...interaction,
          scheduledAt: interaction.scheduledAt, // map scheduledAt back to scheduledAt for UI
          notes: displayNotes,
          brief,
          client: client ? {
            companyName: client.companyName,
          } : null,
        };
      })
    );

    return { ...results, page };
  },
});
