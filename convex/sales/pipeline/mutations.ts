import { authComponent } from '../../auth';
import { requireRoles } from "../../users";
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { clientStatusValidator, pipelinePriorityValidator } from "../../schema";
import { Doc } from "../../_generated/dataModel";
import { aggregatePipeline, aggregatePipelineBySalesPerson } from "../aggregates";

export const createClient = mutation({
  args: {
    companyName: v.string(),
    contact: v.string(),
    status: clientStatusValidator,
    priority: pipelinePriorityValidator,
    email: v.string(),
    phone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
    salesPersonId: v.optional(v.string()),
    activity: v.optional(v.string()),
    nif: v.optional(v.string()),
    rc: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "sales", "leadSales"]);

    // Filter out empty strings so optional fields are absent from the DB doc, not stored as ""
    const cleanArgs = Object.fromEntries(
      Object.entries(args).filter(([, v]) => v !== "")
    ) as typeof args;

    const clientId = await ctx.db.insert("clients", {
      ...cleanArgs,
      isActive: true,
      assignedBy: cleanArgs.salesPersonId ? user._id : undefined,
      assignedAt: cleanArgs.salesPersonId ? Date.now() : undefined,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const doc = await ctx.db.get(clientId);
    await aggregatePipeline.insert(ctx, doc!);
    await aggregatePipelineBySalesPerson.insert(ctx, doc!);

    return clientId;
  },
});

export const assignSalesPerson = mutation({
  args: {
    clientId: v.id("clients"),
    salesPersonId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "leadSales"]);

    const isUnassigning = args.salesPersonId === "";
    const oldDoc = await ctx.db.get(args.clientId);

    await ctx.db.patch(args.clientId, {
      salesPersonId: isUnassigning ? undefined : args.salesPersonId,
      assignedBy: isUnassigning ? undefined : user._id,
      assignedAt: isUnassigning ? undefined : Date.now(),
      updatedAt: Date.now(),
    });

    const newDoc = await ctx.db.get(args.clientId);
    await aggregatePipeline.replace(ctx, oldDoc!, newDoc!);
    await aggregatePipelineBySalesPerson.replace(ctx, oldDoc!, newDoc!);
  },
});

export const claimLead = mutation({
  args: {
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "leadSales", "sales"]);

    const oldDoc = await ctx.db.get(args.clientId);

    await ctx.db.patch(args.clientId, {
      salesPersonId: user._id,
      assignedBy: user._id,
      assignedAt: Date.now(),
      updatedAt: Date.now(),
    });

    const newDoc = await ctx.db.get(args.clientId);
    await aggregatePipeline.replace(ctx, oldDoc!, newDoc!);
    await aggregatePipelineBySalesPerson.replace(ctx, oldDoc!, newDoc!);
  },
});

export const updateClient = mutation({
  args: {
    clientId: v.id("clients"),
    companyName: v.string(),
    contact: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    secondaryPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    status: clientStatusValidator,
    priority: pipelinePriorityValidator,
    salesPersonId: v.optional(v.string()),
    notes: v.optional(v.string()),
    nif: v.optional(v.string()),
    rc: v.optional(v.string()),
    activity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const { clientId, ...updateData } = args;

    const existingClient = await ctx.db.get(clientId);
    if (!existingClient) throw new Error("Client not found");

    const cleanData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== "")
    ) as typeof updateData;

    const patchData: Partial<Doc<"clients">> = {
      ...cleanData,
      updatedAt: Date.now(),
    };

    if (updateData.salesPersonId !== existingClient.salesPersonId) {
      patchData.assignedAt = updateData.salesPersonId ? Date.now() : undefined;
      patchData.assignedBy = updateData.salesPersonId ? user._id : undefined;
    }

    await ctx.db.patch(clientId, patchData);

    const newDoc = await ctx.db.get(clientId);
    await aggregatePipeline.replace(ctx, existingClient, newDoc!);
    await aggregatePipelineBySalesPerson.replace(ctx, existingClient, newDoc!);
  },
});

export const deleteClient = mutation({
  args: { clientId: v.id("clients") },
  handler: async (ctx, args) => {
    const oldDoc = await ctx.db.get(args.clientId);
    await ctx.db.delete(args.clientId);
    if (oldDoc) {
      await aggregatePipeline.delete(ctx, oldDoc);
      await aggregatePipelineBySalesPerson.delete(ctx, oldDoc);
    }
    return { success: true };
  },
});

export const batchDeleteClients = mutation({
  args: { clientIds: v.array(v.id("clients")) },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

    for (const id of args.clientIds) {
      const oldDoc = await ctx.db.get(id);
      await ctx.db.delete(id);
      if (oldDoc) {
        await aggregatePipeline.delete(ctx, oldDoc);
        await aggregatePipelineBySalesPerson.delete(ctx, oldDoc);
      }
    }
    return { success: true };
  },
});

export const batchAssignSalesPerson = mutation({
  args: { 
    clientIds: v.array(v.id("clients")),
    salesPersonId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "leadSales"]);

    const timestamp = Date.now();
    for (const id of args.clientIds) {
      const oldDoc = await ctx.db.get(id);
      await ctx.db.patch(id, {
        salesPersonId: args.salesPersonId,
        assignedBy: user._id,
        assignedAt: timestamp,
        updatedAt: timestamp,
      });
      const newDoc = await ctx.db.get(id);
      await aggregatePipeline.replace(ctx, oldDoc!, newDoc!);
      await aggregatePipelineBySalesPerson.replace(ctx, oldDoc!, newDoc!);
    }
    return { success: true };
  },
});

export const batchClaimLeads = mutation({
  args: { clientIds: v.array(v.id("clients")) },
  handler: async (ctx, args) => {
    const user = await requireRoles(ctx, ["admin", "leadSales", "sales"]);

    const timestamp = Date.now();
    for (const id of args.clientIds) {
      const oldDoc = await ctx.db.get(id);
      await ctx.db.patch(id, {
        salesPersonId: user._id,
        assignedBy: user._id,
        assignedAt: timestamp,
        updatedAt: timestamp,
      });
      const newDoc = await ctx.db.get(id);
      await aggregatePipeline.replace(ctx, oldDoc!, newDoc!);
      await aggregatePipelineBySalesPerson.replace(ctx, oldDoc!, newDoc!);
    }
    return { success: true };
  },
});
 