import { v } from "convex/values";
import { mutation } from "@/convex/_generated/server";
import { requireRoles } from "@/convex/users";
import { projectTypeValidator, paymentMethodValidator, projectStatusValidator } from "../../schema";
import { MutationCtx } from "@/convex/_generated/server";
import { Id } from "@/convex/_generated/dataModel";
import { syncBillingSummary } from "@/convex/admin/payements/syncBillingSummary";

/**
 * Helper to check if a user is allowed to mutate client data.
 */
async function checkClientAccess(
  ctx: MutationCtx,
  clientId: Id<"clients">,
  userId: string,
  isManagerOrAdmin: boolean
) {
  const client = await ctx.db.get(clientId);
  if (!client || client.status !== "converted") {
    throw new Error("Client not found or not converted");
  }

  if (isManagerOrAdmin) return client;

  const isOwner = client.salesPersonId === userId;
  const isCollaborator = await ctx.db
    .query("clientCollaborators")
    .withIndex("by_client_and_user", (q) =>
      q.eq("clientId", clientId).eq("userId", userId)
    )
    .first();

  if (!isOwner && !isCollaborator) {
    throw new Error("Unauthorized to modify this client");
  }

  return client;
}

/**
 * Create a new project for a converted client.
 */
export const createProject = mutation({
  args: {
    clientId: v.id("clients"),
    name: v.string(),
    projectType: projectTypeValidator,
    price: v.number(),
    paymentMethod: paymentMethodValidator,
    estimatedTimeline: v.number(),
    scope: v.string(),
    notes: v.optional(v.string()),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    await checkClientAccess(ctx, args.clientId, user._id, isManagerOrAdmin);

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      clientId: args.clientId,
      name: args.name,
      projectType: args.projectType,
      price: args.price,
      paymentMethod: args.paymentMethod,
      estimatedTimeline: args.estimatedTimeline,
      scope: args.scope,
      notes: args.notes,
      status: "pending_initial_payment",
      features: args.features,
      salesPersonId: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // Append project ID to client's projectIds array
    const client = await ctx.db.get(args.clientId);
    if (client) {
      const currentProjectIds = client.projectIds || [];
      await ctx.db.patch(args.clientId, {
        projectIds: [...currentProjectIds, projectId],
        updatedAt: now,
      });
    }

    await syncBillingSummary(ctx, args.clientId);

    return projectId;
  },
});

/**
 * Batch assign multiple converted clients to a salesperson.
 * Restricted to admin and leadSales.
 */
export const batchAssignClients = mutation({
  args: {
    clientIds: v.array(v.id("clients")),
    salesPersonId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "leadSales"]);
    const now = Date.now();

    for (const clientId of args.clientIds) {
      const client = await ctx.db.get(clientId);
      if (!client || client.status !== "converted") {
        continue;
      }

      await ctx.db.patch(clientId, {
        salesPersonId: args.salesPersonId,
        assignedAt: now,
        assignedBy: user._id,
        updatedAt: now,
      });
    }
  },
});

/**
 * Batch claim multiple converted clients for the logged-in salesperson.
 */
export const batchClaimClients = mutation({
  args: {
    clientIds: v.array(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const now = Date.now();

    for (const clientId of args.clientIds) {
      const client = await ctx.db.get(clientId);
      if (!client || client.status !== "converted") {
        continue;
      }

      // If client is already assigned, only admin/leadSales can reassign via claim
      if (client.salesPersonId && client.salesPersonId !== user._id && user.role === "sales") {
        continue;
      }

      await ctx.db.patch(clientId, {
        salesPersonId: user._id,
        assignedAt: now,
        assignedBy: user._id,
        updatedAt: now,
      });
    }
  },
});

/**
 * Add a collaborator to a converted client.
 */
export const addCollaborator = mutation({
  args: {
    clientId: v.id("clients"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    await checkClientAccess(ctx, args.clientId, user._id, isManagerOrAdmin);

    // Verify collaborator not already added
    const existing = await ctx.db
      .query("clientCollaborators")
      .withIndex("by_client_and_user", (q) =>
        q.eq("clientId", args.clientId).eq("userId", args.userId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert("clientCollaborators", {
      clientId: args.clientId,
      userId: args.userId,
      addedBy: user._id,
      createdAt: now,
    });
  },
});

/**
 * Remove a collaborator from a converted client.
 */
export const removeCollaborator = mutation({
  args: {
    clientId: v.id("clients"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    await checkClientAccess(ctx, args.clientId, user._id, isManagerOrAdmin);

    const collaborator = await ctx.db
      .query("clientCollaborators")
      .withIndex("by_client_and_user", (q) =>
        q.eq("clientId", args.clientId).eq("userId", args.userId)
      )
      .first();

    if (collaborator) {
      await ctx.db.delete(collaborator._id);
    }
  },
});

/**
 * Update an existing project.
 */
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    projectType: projectTypeValidator,
    price: v.number(),
    paymentMethod: paymentMethodValidator,
    estimatedTimeline: v.number(),
    scope: v.string(),
    notes: v.optional(v.string()),
    status: projectStatusValidator,
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await checkClientAccess(ctx, project.clientId, user._id, isManagerOrAdmin);

    const now = Date.now();
    await ctx.db.patch(args.projectId, {
      name: args.name,
      projectType: args.projectType,
      price: args.price,
      paymentMethod: args.paymentMethod,
      estimatedTimeline: args.estimatedTimeline,
      scope: args.scope,
      notes: args.notes || undefined,
      status: args.status,
      features: args.features,
      updatedAt: now,
    });

    await syncBillingSummary(ctx, project.clientId);
  },
});

/**
 * Delete an existing project.
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    const isManagerOrAdmin = user.role === "admin" || user.role === "leadSales";

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    await checkClientAccess(ctx, project.clientId, user._id, isManagerOrAdmin);

    // Remove project ID from client's projectIds array
    const client = await ctx.db.get(project.clientId);
    if (client && client.projectIds) {
      await ctx.db.patch(project.clientId, {
        projectIds: client.projectIds.filter((id) => id !== args.projectId),
        updatedAt: Date.now(),
      });
    }

    await ctx.db.delete(args.projectId);

    await syncBillingSummary(ctx, project.clientId);
  },
});
