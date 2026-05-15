// convex/users.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { components } from "./_generated/api";
import { authComponent } from "./auth";
  


export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
  },
});
  
export const getPaginatedUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    role: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("latest"), v.literal("oldest"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "user",
      paginationOpts: {
        cursor: args.paginationOpts.cursor,
        numItems: args.paginationOpts.numItems,
      },
      ...(args.role && args.role !== "all" && {
        where: [{ field: "role", operator: "eq", value: args.role }],
      }),
      sortBy: {
        field: "createdAt",
        direction: args.sortOrder === "oldest" ? "asc" : "desc",
      },
    });

    // search post-fetch (no full-text on component storage)
    if (args.search) {
      const s = args.search.toLowerCase();
      result.page = result.page.filter(
        (u: { name: string | null; email: string | null; }) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }

    return result;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;

    return await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name: args.name,
          email: args.email,
          emailVerified: args.emailVerified ?? false,
          role: args.role ?? "user",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    });
  },
});

export const deleteUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;

    return await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: args.userId }],
      },
    });
  },
});

export const deleteUsers = mutation({
  args: {
    userIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;

    return await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "in", value: args.userIds }],
      },
      paginationOpts: { cursor: null, numItems: args.userIds.length },
    });
  },
});


// convex/users.ts - add to existing file
export const banUser = mutation({
  args: { 
    userId: v.string(), 
    banned: v.boolean(),
    banReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;
    
    const result = await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: args.userId }],
        update: { 
          banned: args.banned, 
          banReason: args.banned ? (args.banReason ?? null) : null,
          banExpires: null,
          updatedAt: Date.now() 
        },
      },
    });

    if (args.banned) {
      // Instantly revoke all active sessions for the user
      await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
        input: {
          model: "session",
          where: [{ field: "userId", operator: "eq", value: args.userId }],
        },
        paginationOpts: { cursor: null, numItems: 100 },
      });
    }

    return result;
  },
});

export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return [];

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "session",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
      paginationOpts: { cursor: null, numItems: 100 },
    });

    // The Better Auth adapter returns { page: Session[], hasMore: boolean, ... }
    return result.page;
  },
});

export const revokeSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser || currentUser.role !== "admin") return null;

    return await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "session",
        where: [{ field: "_id", operator: "eq", value: args.sessionId }],
      },
    });
  },
});