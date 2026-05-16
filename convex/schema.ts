import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the status union once to ensure referential integrity across all tables
export const clientStatusValidator = v.union(
    v.literal("prospect"),
    v.literal("initial_contact"),
    v.literal("negotiation"),
    v.literal("verbal_agreement"),
    v.literal("converted"),
    v.literal("lost"),
    v.literal("out_of_target")
);

export const pipelinePriorityValidator = v.union(
    v.literal("high"),
    v.literal("medium"),
    v.literal("low"),
    v.literal("urgent"),
);


export default defineSchema({
    // Clients table - The core Sales Pipeline entity
    clients: defineTable({
        companyName: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        secondaryPhone: v.optional(v.string()),
        address: v.optional(v.string()),

        // Primary Contact info
        contact: v.string(),
        contactPhone: v.optional(v.string()),
        contactEmail: v.optional(v.string()),

        signDate: v.optional(v.number()),
        nif: v.optional(v.string()),
        rc: v.optional(v.string()),
        activity: v.optional(v.string()),
        salesPersonId: v.optional(v.string()), // Better Auth User ID (String for component isolation)
        status: clientStatusValidator, // Using shared validator
        priority: pipelinePriorityValidator,
        lostReason: v.optional(v.string()),
        source: v.optional(v.union(v.literal("landing_page"), v.literal("admin_app"))),
        assignedAt: v.optional(v.number()),
        assignedBy: v.optional(v.string()),
        lastInteractionAt: v.optional(v.number()),
        nextActionAt: v.optional(v.number()),
        notes: v.optional(v.string()),
        isActive: v.boolean(),
        createdBy: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_status", ["status"])
        .index("by_priority", ["priority"])
        .index("by_is_active", ["isActive"]) // Added index for faster filtering
        .index("by_assigned_at", ["assignedAt"])
        .index("by_next_action", ["nextActionAt"])
        .index("by_company_name", ["companyName", "contact"])
        .index("by_company_email", ["email"])
        .index("by_sales_person", ["salesPersonId"])
        .index("by_sales_person_status_updated", ["salesPersonId", "status", "updatedAt"])
        .index("by_sales_person_last_interaction", ["salesPersonId", "lastInteractionAt"])
        .index("by_status_updated", ["status", "updatedAt"])
        .index("by_status_created", ["status", "createdAt"])
        .searchIndex("search_company", {
            searchField: "companyName",
        }),

    // Client Status Log - Historical tracking of pipeline movement
    clientStatusLog: defineTable({
        clientId: v.id("clients"),
        userId: v.string(),
        oldStatus: v.optional(clientStatusValidator), // Using shared validator
        newStatus: clientStatusValidator, // Using shared validator
        notes: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_client", ["clientId"])
        .index("by_old_status", ["oldStatus"])
        .index("by_new_status", ["newStatus"])
        .index("by_created_at", ["createdAt"]),

    // Client Meetings - Formal events
    clientMeetings: defineTable({
        clientId: v.id("clients"),
        userId: v.string(),
        scheduledAt: v.number(),
        type: v.union(
            v.literal("in_office"),
            v.literal("remote"),
            v.literal("client_office"),
        ),
        location: v.optional(v.string()),
        status: v.union(
            v.literal("scheduled"),
            v.literal("completed"),
            v.literal("missed"),
            v.literal("cancelled")
        ),
        outcome: v.optional(v.union(
            v.literal("positive"),
            v.literal("neutral"),
            v.literal("negative")
        )),
        notes: v.optional(v.string()),
        brief: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_client", ["clientId"])
        .index("by_user", ["userId"])
        .index("by_meeting_date", ["scheduledAt"])
        .index("by_meeting_status", ["status"])
        .index("by_user_and_scheduled", ["userId", "scheduledAt"]),

    // Client Interactions - Calls, emails, quick touches
    clientInteractions: defineTable({
        clientId: v.id("clients"),
        userId: v.string(),
        type: v.union(
            v.literal("call"),
            v.literal("email"),
        ),
        occurredAt: v.number(),
        status: v.union(
            v.literal("scheduled"),
            v.literal("completed"),
            v.literal("missed"),
            v.literal("no_response")
        ),
        outcome: v.optional(v.union(
            v.literal("positive"),
            v.literal("neutral"),
            v.literal("negative")
        )),
        notes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_client", ["clientId"])
        .index("by_user", ["userId"])
        .index("by_contact_date", ["occurredAt"])
        .index("by_user_and_occurred", ["userId", "occurredAt"]),

    // CRM Reminders - Task notifications for the team
    crmReminders: defineTable({
        userId: v.string(),
        clientId: v.optional(v.id("clients")),
        entityType: v.union(
            v.literal("meeting"),
            v.literal("interaction") // Changed "contact" to "interaction" to match tables
        ),
        entityId: v.optional(v.string()),
        remindAt: v.number(),
        notes: v.optional(v.string()),
        isSent: v.boolean(),
        isSeen: v.boolean(),
        createdAt: v.number(),
    })
        .index("by_client", ["clientId"])
        .index("by_user", ["userId"])
        .index("by_remind_at", ["remindAt"])
        .index("by_user_seen_remind_at", ["userId", "isSeen", "remindAt"]),
});