import { v } from "convex/values";
import { query } from "../../_generated/server";
import { requireRoles } from "../../users";
import { paginationOptsValidator } from "convex/server";

export const getClientMeetingsPaginated = query({
  args: {
    clientId: v.id("clients"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    
    const results = await ctx.db
      .query("clientMeetings")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .paginate(args.paginationOpts);

    return results;
  },
});

export const getMeetingsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    )),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const order = args.sortOrder === "oldest" ? "asc" : "desc";

    let results;
    if (args.status) {
      results = await ctx.db
        .query("clientMeetings")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("status"), args.status!))
        .order(order)
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("clientMeetings")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .order(order)
        .paginate(args.paginationOpts);
    }

    const page = await Promise.all(
      results.page.map(async (meeting) => {
        const client = await ctx.db.get(meeting.clientId);
        return {
          ...meeting,
          client: client ? {
            companyName: client.companyName,
            contact: client.contact,
          } : null,
        };
      })
    );

    return { ...results, page };
  },
});
