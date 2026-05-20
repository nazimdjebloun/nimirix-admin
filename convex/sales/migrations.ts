import { mutation } from "../_generated/server";
import { aggregatePipeline, aggregatePipelineBySalesPerson, aggregateInteractionsByUser, aggregateMeetingsByUser } from "./aggregates";

function isDuplicateKeyError(e: unknown): boolean {
  return e instanceof Error && e.message.includes("already exists");
}

export const backfillClients = mutation({
  args: {},
  handler: async (ctx) => {
    let backfilled = 0;
    let cursor: string | null = null;
    while (true) {
      const page = await ctx.db.query("clients").paginate({ cursor, numItems: 100 });
      for (const doc of page.page) {
        try { await aggregatePipeline.insert(ctx, doc); } catch (e) { if (!isDuplicateKeyError(e)) throw e; }
        try { await aggregatePipelineBySalesPerson.insert(ctx, doc); } catch (e) { if (!isDuplicateKeyError(e)) throw e; }
        backfilled++;
      }
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    return { success: true, backfilled };
  },
});

export const backfillInteractions = mutation({
  args: {},
  handler: async (ctx) => {
    let backfilled = 0;
    let cursor: string | null = null;
    while (true) {
      const page = await ctx.db.query("clientInteractions").paginate({ cursor, numItems: 100 });
      for (const doc of page.page) {
        try { await aggregateInteractionsByUser.insert(ctx, doc); } catch (e) { if (!isDuplicateKeyError(e)) throw e; }
        backfilled++;
      }
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    return { success: true, backfilled };
  },
});

export const backfillMeetings = mutation({
  args: {},
  handler: async (ctx) => {
    let backfilled = 0;
    let cursor: string | null = null;
    while (true) {
      const page = await ctx.db.query("clientMeetings").paginate({ cursor, numItems: 100 });
      for (const doc of page.page) {
        try { await aggregateMeetingsByUser.insert(ctx, doc); } catch (e) { if (!isDuplicateKeyError(e)) throw e; }
        backfilled++;
      }
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    return { success: true, backfilled };
  },
});

export const backfillStatusLogsIsFinalStage = mutation({
  args: {},
  handler: async (ctx) => {
    let backfilled = 0;
    let cursor: string | null = null;
    while (true) {
      const page = await ctx.db.query("clientStatusLog").paginate({ cursor, numItems: 100 });
      for (const doc of page.page) {
        if (doc.isFinalStage === undefined) {
          const isFinal = ["converted", "lost", "out_of_target"].includes(doc.newStatus);
          await ctx.db.patch(doc._id, { isFinalStage: isFinal });
          backfilled++;
        }
      }
      if (page.isDone) break;
      cursor = page.continueCursor;
    }
    return { success: true, backfilled };
  },
});
