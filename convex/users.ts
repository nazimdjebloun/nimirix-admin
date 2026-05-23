// convex/users.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { components } from "./_generated/api";
import { authComponent } from "./auth";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { DataModel } from "./_generated/dataModel";
import { Role } from "../lib/auth/roles";

/* ==========================================================================
   1. INTERNAL BACKEND HELPERS
   ========================================================================== */



/**
 * Reusable helper to find a user by their ID.
 * Can be used within other Convex queries/mutations.
 */
export async function getUserById(ctx: GenericCtx<DataModel>, userId: string) {
  return await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "_id", operator: "eq", value: userId }],
  });
}

export type CompactUser = {
  name: string;
  role: string;
};

/**
 * Fetches multiple users by their IDs in a single deduplicated batch query.
 * Prevents redundant database lookups (read amplification) when fetching lists.
 */
export async function getUsersByIds(
  ctx: GenericCtx<DataModel>,
  ids: string[]
): Promise<Map<string, CompactUser | null>> {
  // 1. Filter out empty, undefined, and duplicate IDs
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => !!id)));

  if (uniqueIds.length === 0) {
    return new Map();
  }

  // 2. Fetch all unique users concurrently
  const users = await Promise.all(
    uniqueIds.map((id) => getUserById(ctx, id))
  );

  // 3. Populate a fast-lookup map
  const userMap = new Map<string, CompactUser | null>();

  uniqueIds.forEach((id, index) => {
    const user = users[index];
    if (user) {
      userMap.set(id, {
        name: user.name as string,
        role: (user.role as string) ?? "",
      });
    } else {
      userMap.set(id, null);
    }
  });

  return userMap;
}



/**
 * Ensures the user is authenticated and has one of the allowed roles.
 * Throws an error if unauthorized, otherwise returns the authenticated user object.
 */
export async function requireRoles(
  ctx: GenericCtx<DataModel>,
  allowedRoles: Role[]
) {
  let user;
  try {
    user = await authComponent.getAuthUser(ctx);
  } catch {
    throw new Error("Unauthorized");
  }
  if (!user) {
    throw new Error("Unauthorized");
  }

  const userRole = user.role as Role;
  if (!allowedRoles.includes(userRole)) {
    throw new Error(`Insufficient permissions`);
  }

  return user;
}




/* ==========================================================================
   2. SESSION & CURRENT USER QUERIES
   ========================================================================== */

/**
 * Fetches the currently authenticated session's user.
 */
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

/* ==========================================================================
   3. USER READ QUERIES
   ========================================================================== */

/**
 * Fetches a single user by their ID. Can be used from frontend.
 */
export const getUser = query({
  args: { id: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.id) return null;
    return await getUserById(ctx, args.id);
  },
});

/**
 * Fetches paginated users with filtering (by role, search queries) and sorting options.
 * Restrained to Admin users only.
 */
export const getPaginatedUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    role: v.optional(v.string()),
    sortOrder: v.optional(v.union(v.literal("latest"), v.literal("oldest"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

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

    // Search post-fetch (no full-text indexing on component storage)
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

/**
 * Searches users by role and name (contains query), with support for including a specific user by ID.
 * Returns up to a specified limit (defaults to 5).
 */
export const searchUsers = query({
  args: {
    search: v.optional(v.string()),
    roles: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
    includeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await authComponent.getAuthUser(ctx);
    if (!currentUser) return [];

    const limit = args.limit ?? 5;

    // Build query constraints: role filter + optional name search via adapter's 'contains' operator
    const where: Array<{
      field: string;
      operator: "in" | "contains" | "eq";
      value: string | string[];
      connector?: "AND" | "OR";
    }> = [];

    if (args.roles && args.roles.length > 0) {
      where.push({ field: "role", operator: "in", value: args.roles });
    }

    if (args.search) {
      where.push({ field: "name", operator: "contains", value: args.search, connector: "AND" });
    }

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "user",
      limit,
      offset: 0,
      paginationOpts: { cursor: null, numItems: limit },
      ...(where.length > 0 ? { where } : {}),
      sortBy: { field: "createdAt", direction: "desc" as const },
    });

    let users = result.page || [];

    // If includeId is provided and not in the list, fetch it and prepend it to the results
    if (args.includeId && !users.some((u: { _id: string }) => u._id === args.includeId)) {
      const specificUser = await getUserById(ctx, args.includeId);
      if (specificUser) {
        users = [specificUser, ...users];
      }
    }

    return users;
  },
});

/* ==========================================================================
   4. USER WRITE MUTATIONS
   ========================================================================== */

/**
 * Creates a new user record inside the Better Auth database.
 * Restrained to Admin users only.
 */
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

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

/**
 * Updates a user's role.
 */
export const updateUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.betterAuth.adapter.updateOne, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: args.userId }],
        update: {
          role: args.role,
          updatedAt: Date.now()
        },
      },
    });
  },
});

/**
 * Deletes a single user record from the database.
 * Restrained to Admin users only.
 */
export const deleteUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

    return await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: args.userId }],
      },
    });
  },
});

/**
 * Performs a batch deletion of multiple user records.
 * Restrained to Admin users only.
 */
export const deleteUsers = mutation({
  args: {
    userIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

    return await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: "user",
        where: [{ field: "_id", operator: "in", value: args.userIds }],
      },
      paginationOpts: { cursor: null, numItems: args.userIds.length },
    });
  },
});

/* ==========================================================================
   5. MODERATION & SESSIONS (BANS / REVOCATION)
   ========================================================================== */

/**
 * Bans or unbans a user. If banning, instantly terminates all active sessions for the user.
 * Restrained to Admin users only.
 */
export const banUser = mutation({
  args: { 
    userId: v.string(), 
    banned: v.boolean(),
    banReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);
    
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

/**
 * Lists all active sessions belonging to a specific user.
 * Restrained to Admin users only.
 */
export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

    const result = await ctx.runQuery(components.betterAuth.adapter.findMany, {
      model: "session",
      where: [{ field: "userId", operator: "eq", value: args.userId }],
      paginationOpts: { cursor: null, numItems: 100 },
    });

    return result.page;
  },
});

/**
 * Revokes an active session by its ID.
 * Restrained to Admin users only.
 */
export const revokeSession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin"]);

    return await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "session",
        where: [{ field: "_id", operator: "eq", value: args.sessionId }],
      },
    });
  },
});
