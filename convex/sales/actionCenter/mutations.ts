import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { requireRoles } from "../../users";

/**
 * Marks a reminder as seen/completed.
 */
export const markReminderSeen = mutation({
  args: { reminderId: v.id("crmReminders") },
  handler: async (ctx, args) => {
    await requireRoles(ctx, ["admin", "sales", "leadSales"]);
    await ctx.db.patch(args.reminderId, { isSeen: true });
  },
});
