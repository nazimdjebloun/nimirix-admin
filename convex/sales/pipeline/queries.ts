import { authComponent } from "../../auth";
import { v } from "convex/values";
import { query, QueryCtx } from "../../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { clientStatusValidator, pipelinePriorityValidator } from "../../schema";
import { components } from "../../_generated/api";


export async function fetchUserById(
  ctx: QueryCtx,
  id: string | undefined
): Promise<{ name: string; role: string } | null> {
  if (!id) return null;

  const result = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "_id", operator: "eq", value: id }],
  });

  if (!result) return null;

  return {
    name: result.name as string,
    role: (result.role as string) ?? "",
  };
}


const userRef = v.union(v.object({ name: v.string(), role: v.string() }), v.null());


const clientDocValidator = v.object({
  _id: v.id("clients"),
  _creationTime: v.number(),
  companyName: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  secondaryPhone: v.optional(v.string()),
  address: v.optional(v.string()),
  contact: v.string(),
  contactPhone: v.optional(v.string()),
  contactEmail: v.optional(v.string()),
  signDate: v.optional(v.number()),
  nif: v.optional(v.string()),
  rc: v.optional(v.string()),
  activity: v.optional(v.string()),
  salesPersonId: v.optional(v.string()),
  status: clientStatusValidator,
  priority: pipelinePriorityValidator,
  lostReason: v.optional(v.string()),
  source: v.optional(v.union(v.literal("landing_page"), v.literal("admin_app"))),
  assignedAt: v.optional(v.number()),
  lastInteractionAt: v.optional(v.number()),
  nextActionAt: v.optional(v.number()),
  notes: v.optional(v.string()),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  assignedBy: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  // Joined fields
  salesPerson: userRef,
  createdByUser: userRef,
  assignedByUser: userRef,
});




export const getPipeline = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    status: v.optional(v.union(clientStatusValidator, v.literal("all"))),
    sortOrder: v.optional(v.union(v.literal("latest"), v.literal("oldest"))),
    pageSize: v.optional(v.number()),
  },
  returns: v.object({
    page: v.array(clientDocValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    pageStatus: v.optional(v.union(v.string(), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) {
      throw new Error("Unauthorized");
    }

    const { search, status, sortOrder = "latest" } = args;
    const activeStatus = (status && status !== "all") ? status : null;

    // PATH 1: Search — use search index, apply status filter in JS (unavoidable with search)
    // PATH 2: Status tab set — use by_status index for proper DB-level pagination
    // PATH 3: All — use by_is_active index
    const paginatedResults = search
      ? await ctx.db
          .query("clients")
          .withSearchIndex("search_company", (q) => q.search("companyName", search))
          .paginate(args.paginationOpts)
      : activeStatus
      ? await ctx.db
          .query("clients")
          .withIndex("by_status", (q) => q.eq("status", activeStatus))
          .order(sortOrder === "latest" ? "desc" : "asc")
          .paginate(args.paginationOpts)
      : await ctx.db
          .query("clients")
          .withIndex("by_is_active", (q) => q.eq("isActive", true))
          .filter((q) => 
            q.and(
              q.neq(q.field("status"), "lost"),
              q.neq(q.field("status"), "out_of_target"),
              q.neq(q.field("status"), "converted")
            )
          )
          .order(sortOrder === "latest" ? "desc" : "asc")
          .paginate(args.paginationOpts);

    // When searching, still apply status filter in JS (search index limitation)
    const filtered = (search && activeStatus)
      ? paginatedResults.page.filter((c) => c.status === activeStatus)
      : paginatedResults.page;

    // Join: fetch sales person name + role from the user table
const page = await Promise.all(
  filtered.map(async (client) => {
    const [salesPerson, createdByUser, assignedByUser] = await Promise.all([
      fetchUserById(ctx, client.salesPersonId),
      fetchUserById(ctx, client.createdBy),
      fetchUserById(ctx, client.assignedBy),
    ]);

    return { ...client, salesPerson, createdByUser, assignedByUser };
  })
);

    return {
      ...paginatedResults,
      page,
    };
  },
});
