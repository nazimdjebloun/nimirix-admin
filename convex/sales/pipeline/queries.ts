import { getUserById, getUsersByIds, requireRoles } from "../../users";
import { v } from "convex/values";
import { query, QueryCtx } from "../../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { clientStatusValidator, pipelinePriorityValidator } from "../../schema";


export async function fetchUserById(
  ctx: QueryCtx,
  id: string | undefined
): Promise<{ name: string; role: string } | null> {
  if (!id) return null;

  const result = await getUserById(ctx, id);

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
  projectIds: v.optional(v.array(v.id("projects"))),
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
    filter: v.optional(v.union(v.literal("all"), v.literal("clients"), v.literal("available"))),
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
    const currentUser = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    const { search, status, filter, sortOrder = "latest" } = args;
    const activeStatus = (status && status !== "all") ? status : null;

    const requireAvailableFilter = filter === "available";
    const requireClientsFilter = filter === "clients";

    const paginatedResults = search
      ? await ctx.db
          .query("clients")
          .withSearchIndex("search_company", (q) => q.search("companyName", search))
          .paginate(args.paginationOpts)
      : requireClientsFilter && !activeStatus
        ? await ctx.db
            .query("clients")
            .withIndex("by_sales_person", (q) => q.eq("salesPersonId", currentUser._id))
            .order(sortOrder === "latest" ? "desc" : "asc")
            .paginate(args.paginationOpts)
        : await (async () => {
            const useStatusIndex = !!activeStatus;
            let q = useStatusIndex
              ? ctx.db.query("clients").withIndex("by_status", (qb) => qb.eq("status", activeStatus))
              : ctx.db
                  .query("clients")
                  .withIndex("by_is_active", (qb) => qb.eq("isActive", true))
                  .filter((qb) =>
                    qb.and(
                      qb.neq(qb.field("status"), "lost"),
                      qb.neq(qb.field("status"), "out_of_target"),
                      qb.neq(qb.field("status"), "converted")
                    )
                  );

            if (requireClientsFilter) {
              q = q.filter((qb) => qb.eq(qb.field("salesPersonId"), currentUser._id));
            } else if (requireAvailableFilter) {
              q = q.filter((qb) => qb.eq(qb.field("salesPersonId"), undefined));
            }

            return q.order(sortOrder === "latest" ? "desc" : "asc").paginate(args.paginationOpts);
          })();

    // When searching, still apply status + ownership/availability filter in JS (search index limitation)
    let filtered = paginatedResults.page;
    if (search && activeStatus) {
      filtered = filtered.filter((c) => c.status === activeStatus);
    }
    if (search && requireClientsFilter) {
      filtered = filtered.filter((c) => c.salesPersonId === currentUser._id);
    }
    if (search && requireAvailableFilter) {
      filtered = filtered.filter((c) => !c.salesPersonId);
    }

    // Join: fetch sales person name + role from the user table using batch loading
    const allUserIds: string[] = [];
    filtered.forEach((client) => {
      if (client.salesPersonId) allUserIds.push(client.salesPersonId);
      if (client.createdBy) allUserIds.push(client.createdBy);
      if (client.assignedBy) allUserIds.push(client.assignedBy);
    });

    const userMap = await getUsersByIds(ctx, allUserIds);

    const page = filtered.map((client) => {
      const salesPerson = client.salesPersonId ? (userMap.get(client.salesPersonId) ?? null) : null;
      const createdByUser = client.createdBy ? (userMap.get(client.createdBy) ?? null) : null;
      const assignedByUser = client.assignedBy ? (userMap.get(client.assignedBy) ?? null) : null;

      return { ...client, salesPerson, createdByUser, assignedByUser };
    });

    return {
      ...paginatedResults,
      page,
    };
  },
});
