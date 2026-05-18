// import { mutation, query } from "@/convex/_generated/server";
// import { v } from "convex/values";
// import { requireRoles } from "@/convex/users";

// /**
//  * Get full CRM details for a client (used in the detail sheet).
//  */
// export const getClientCrmDetails = query({
//   args: { clientId: v.id("clients") },
//   handler: async (ctx, args) => {
//     await requireRoles(ctx, ["admin", "sales"]);

//     const client = await ctx.db.get(args.clientId);
//     if (!client) return null;

//     // Salesperson info
//     const salesPerson = client.salesPersonId
//       ? await ctx.db.get(client.salesPersonId)
//       : null;

//     // All interactions for this client
//     const interactions = await ctx.db
//       .query("clientInteractions")
//       .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
//       .order("desc")
//       .collect();

//     // Interaction stats
//     const interactionStats = {
//       totalCalls: interactions.filter((i) => i.type === "call").length,
//       totalEmails: interactions.filter((i) => i.type === "email").length,
//       completedCalls: interactions.filter((i) => i.type === "call" && i.status === "completed").length,
//       completedEmails: interactions.filter((i) => i.type === "email" && i.status === "completed").length,
//       missedCalls: interactions.filter((i) => i.type === "call" && i.status === "missed").length,
//       missedEmails: interactions.filter((i) => i.type === "email" && i.status === "missed").length,
//       noResponseCalls: interactions.filter((i) => i.type === "call" && i.status === "no_response").length,
//       noResponseEmails: interactions.filter((i) => i.type === "email" && i.status === "no_response").length,
//       scheduledCalls: interactions.filter((i) => i.type === "call" && i.status === "scheduled").length,
//       scheduledEmails: interactions.filter((i) => i.type === "email" && i.status === "scheduled").length,
//     };

//     // Last interaction (most recent)
//     const lastInteraction = interactions[0] ?? null;

//     // All meetings for this client
//     const meetings = await ctx.db
//       .query("clientMeetings")
//       .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
//       .order("desc")
//       .collect();

//     // Meeting stats
//     const meetingStats = {
//       total: meetings.length,
//       completed: meetings.filter((m) => m.status === "completed").length,
//       scheduled: meetings.filter((m) => m.status === "scheduled").length,
//       missed: meetings.filter((m) => m.status === "missed").length,
//       cancelled: meetings.filter((m) => m.status === "cancelled").length,
//     };

//     // Last meeting
//     const lastMeeting = meetings[0] ?? null;

//     // Status change log with user names
//     const statusLogs = await ctx.db
//       .query("clientStatusLog")
//       .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
//       .order("desc")
//       .collect();

//     const statusLogsWithUser = await Promise.all(
//       statusLogs.map(async (log) => {
//         const user = await ctx.db.get(log.userId);
//         return {
//           ...log,
//           userName: user ? `${user.firstName} ${user.lastName}` : "Inconnu",
//         };
//       })
//     );

//     return {
//       client,
//       salesPerson: salesPerson
//         ? { firstName: salesPerson.firstName, lastName: salesPerson.lastName }
//         : null,
//       interactionStats,
//       lastInteraction,
//       meetingStats,
//       lastMeeting,
//       statusLog: statusLogsWithUser,
//     };
//   },
// });




// export const createMeeting = mutation({
//   args: {
//     clientId: v.id("clients"),
//     scheduledAt: v.number(),
//     type: v.union(
//       v.literal("in_office"),
//       v.literal("remote"),
//       v.literal("client_office")
//     ),
//     location: v.optional(v.string()),
//     notes: v.optional(v.string()),
//     status: v.optional(
//       v.union(
//         v.literal("scheduled"),
//         v.literal("completed"),
//         v.literal("missed"),
//         v.literal("cancelled")
//       )
//     ),
//   },
//   handler: async (ctx, args) => {
//     const user = await requireRole(ctx, ["admin", "sales"]);
//     const now = Date.now();
    
//     // Auto-update client's last interaction if this is completed or scheduled for now
//     if (args.status === "completed") {
//       await ctx.db.patch(args.clientId, {
//         lastInteractionAt: now,
//         updatedAt: now,
//       });
//     }

//     return await ctx.db.insert("clientMeetings", {
//       clientId: args.clientId,
//       userId: user._id,
//       scheduledAt: args.scheduledAt,
//       type: args.type,
//       location: args.location,
//       notes: args.notes,
//       status: args.status || "scheduled",
//       createdAt: now,
//       updatedAt: now,
//     });
//   },
// });

// export const updateMeeting = mutation({
//   args: {
//     meetingId: v.id("clientMeetings"),
//     scheduledAt: v.optional(v.number()),
//     status: v.optional(
//       v.union(
//         v.literal("scheduled"),
//         v.literal("completed"),
//         v.literal("missed"),
//         v.literal("cancelled")
//       )
//     ),
//     type: v.optional(
//       v.union(
//         v.literal("in_office"),
//         v.literal("remote"),
//         v.literal("client_office")
//       )
//     ),
//     location: v.optional(v.string()),
//     notes: v.optional(v.string()),
//     outcome: v.optional(
//       v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))
//     ),
//   },
//   handler: async (ctx, args) => {
//     await requireRole(ctx, ["admin", "sales"]);
//     const { meetingId, ...fields } = args;
//     const now = Date.now();

//     // Auto-update client's last interaction if this becomes completed
//     if (args.status === "completed") {
//       const meeting = await ctx.db.get(meetingId);
//       if (meeting) {
//         await ctx.db.patch(meeting.clientId, {
//           lastInteractionAt: now,
//           updatedAt: now,
//         });
//       }
//     }
    
//     await ctx.db.patch(meetingId, {
//       ...fields,
//       updatedAt: now,
//     });
//   },
// });

// export const deleteMeeting = mutation({
//   args: {
//     meetingId: v.id("clientMeetings"),
//   },
//   handler: async (ctx, args) => {
//     await requireRole(ctx, ["admin", "sales"]);
//     await ctx.db.delete(args.meetingId);
//   },
// });


// export const createClientInteractions = mutation({
//   args: {
//     contactId: v.id("clientInteractions"),
//     scheduledAt: v.optional(v.number()),
//     scheduledAt: v.optional(v.number()),
//     status: v.optional(
//       v.union(
//       v.literal("completed"),
//       v.literal("missed"),
//       v.literal("no_response")
//       )
//     ),
//     type: v.optional(
//       v.union(
//       v.literal("call"),
//       v.literal("email"),
//       )
//     ),
//     notes: v.optional(v.string()),
//     outcome: v.optional(
//       v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))
//     ),
//   },
//   handler: async (ctx, args) => {
//     await requireRole(ctx, ["admin", "sales"]);
//     const { contactId, ...fields } = args;
    
//     await ctx.db.patch(contactId, {
//       ...fields,
//       updatedAt: Date.now(),
//     });
//   },
// });  



// export const updateClientInteractions = mutation({
//   args: {
//     contactId: v.id("clientInteractions"),
//     scheduledAt: v.optional(v.number()),
//     status: v.optional(
//       v.union(
//       v.literal("completed"),
//       v.literal("missed"),
//       v.literal("no_response")
//       )
//     ),
//     type: v.optional(
//       v.union(
//       v.literal("call"),
//       v.literal("email"),
//       )
//     ),
//     notes: v.optional(v.string()),
//     outcome: v.optional(
//       v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative"))
//     ),
//   },
//   handler: async (ctx, args) => {
//     await requireRole(ctx, ["admin", "sales"]);
//     const { contactId, ...fields } = args;
    
//     await ctx.db.patch(contactId, {
//       ...fields,
//       updatedAt: Date.now(),
//     });
//   },
// });


// export const deleteClientInteractions = mutation({
//   args: {
//     contactId: v.id("clientInteractions"),
//   },
//   handler: async (ctx, args) => {
//     await requireRole(ctx, ["admin", "sales"]);
//     await ctx.db.delete(args.contactId);
//   },
// });