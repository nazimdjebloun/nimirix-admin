import { v } from "convex/values";
import { query } from "@/convex/_generated/server";
import { requireRoles, getUserById } from "@/convex/users";
import { paginationOptsValidator } from "convex/server";

/**
 * Get converted clients with pagination, search, and role-based visibility.
 */
export const getConvertedClientsPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("newest"), v.literal("oldest"))),
    sortBy: v.optional(v.union(v.literal("createdAt"), v.literal("updatedAt"))),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";
    const order = args.sortOrder === "oldest" ? "asc" : "desc";
    const sortBy = args.sortBy || "updatedAt";

    // If standard sales rep, fetch their collaborative client IDs
    let allowedClientIds: Set<string> = new Set();
    if (!isManagerOrAdmin) {
      const collabs = await ctx.db
        .query("clientCollaborators")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();
      allowedClientIds = new Set(collabs.map((c) => c.clientId));
    }

    let results;

    if (args.search) {
      // Search index search
      results = await ctx.db
        .query("clients")
        .withSearchIndex("search_company", (q) =>
          q.search("companyName", args.search!)
        )
        .paginate(args.paginationOpts);

      // Filter search results post-pagination
      results.page = results.page.filter((c) => {
        if (c.status !== "converted" || !c.isActive) return false;
        if (isManagerOrAdmin) return true;
        return c.salesPersonId === user._id || allowedClientIds.has(c._id);
      });
    } else {
      const indexName = sortBy === "createdAt" ? "by_status_created" : "by_status_updated";
      const queryBody = ctx.db
        .query("clients")
        .withIndex(indexName, (q) => q.eq("status", "converted"))
        .filter((q) => q.eq(q.field("isActive"), true));

      if (isManagerOrAdmin) {
        results = await queryBody.order(order).paginate(args.paginationOpts);
      } else {
        // Enforce user visibility
        results = await queryBody
          .filter((q) =>
            q.or(
              q.eq(q.field("salesPersonId"), user._id),
              // Filter helper inside query filter (or post-filtering if complex)
              // Since or-filter in Convex is limited, we post-filter or check in filter
            )
          )
          .order(order)
          .paginate(args.paginationOpts);
        
        // Post-filter to also include collaborative client IDs if not caught by salesPersonId
        results.page = results.page.filter(
          (c) => c.salesPersonId === user._id || allowedClientIds.has(c._id)
        );
      }
    }

    // Resolve owner details
    const page = await Promise.all(
      results.page.map(async (client) => {
        const owner = client.salesPersonId
          ? await getUserById(ctx, client.salesPersonId)
          : null;

        return {
          ...client,
          salesPerson: owner
            ? {
                _id: owner._id,
                name: owner.name,
                email: owner.email,
                role: owner.role,
              }
            : null,
        };
      })
    );

    return { ...results, page };
  },
});

/**
 * Get detailed information about a single converted client, including projects and collaborators.
 */
export const getClientDetails = query({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    const client = await ctx.db.get(args.clientId);
    if (!client || client.status !== "converted") {
      throw new Error("Client not found or not converted");
    }

    // Check permissions
    if (!isManagerOrAdmin) {
      const isOwner = client.salesPersonId === user._id;
      const isCollaborator = await ctx.db
        .query("clientCollaborators")
        .withIndex("by_client_and_user", (q) =>
          q.eq("clientId", args.clientId).eq("userId", user._id)
        )
        .first();

      if (!isOwner && !isCollaborator) {
        throw new Error("Unauthorized access to client details");
      }
    }

    // Fetch projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .order("desc")
      .collect();

    // Fetch collaborators
    const collaboratorsList = await ctx.db
      .query("clientCollaborators")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    const collaborators = await Promise.all(
      collaboratorsList.map(async (collab) => {
        const u = await getUserById(ctx, collab.userId);
        return {
          _id: collab.userId,
          name: u?.name || "Unknown",
          email: u?.email || "",
        };
      })
    );

    const owner = client.salesPersonId
      ? await getUserById(ctx, client.salesPersonId)
      : null;

    return {
      client: {
        ...client,
        salesPerson: owner
          ? {
              _id: owner._id,
              name: owner.name,
              email: owner.email,
              role: owner.role,
            }
          : null,
      },
      projects,
      collaborators,
    };
  },
});
