import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

// Define the status union once to ensure referential integrity across all tables
export const clientStatusValidator = v.union(
  v.literal("prospect"),
  v.literal("initial_contact"),
  v.literal("negotiation"),
  v.literal("verbal_agreement"),
  v.literal("converted"),
  v.literal("lost"),
  v.literal("out_of_target")
)

export const pipelinePriorityValidator = v.union(
  v.literal("high"),
  v.literal("medium"),
  v.literal("low"),
  v.literal("urgent")
)

export const projectTypeValidator = v.union(
  v.literal("ecommerce"),
  v.literal("landing_page"),
  v.literal("erp"),
  v.literal("mobile_app"),
  v.literal("custom")
)

export const paymentMethodValidator = v.union(
  v.literal("bank_transfer"),
  v.literal("cash"),
  v.literal("check"),
  v.literal("card")
)

export const projectStatusValidator = v.union(
  v.literal("pending_initial_payment"),
  v.literal("pending"),
  v.literal("in_planning"),
  v.literal("in_progress"),
  v.literal("pending_payment"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("paused")
)

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
    source: v.optional(
      v.union(v.literal("landing_page"), v.literal("admin_app"))
    ),
    assignedAt: v.optional(v.number()),
    assignedBy: v.optional(v.string()),
    lastInteractionAt: v.optional(v.number()),
    nextActionAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    isActive: v.boolean(),
    projectIds: v.optional(v.array(v.id("projects"))),
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
    .index("by_sales_person_status_updated", [
      "salesPersonId",
      "status",
      "updatedAt",
    ])
    .index("by_sales_person_last_interaction", [
      "salesPersonId",
      "lastInteractionAt",
    ])
    .index("by_status_updated", ["status", "updatedAt"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status_active_updated", ["status", "isActive", "updatedAt"])
    .index("by_status_active_last_interaction", [
      "status",
      "isActive",
      "lastInteractionAt",
    ])
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
    isFinalStage: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_old_status", ["oldStatus"])
    .index("by_new_status", ["newStatus"])
    .index("by_created_at", ["createdAt"])
    .index("by_is_final_stage_created", ["isFinalStage", "createdAt"]),

  // Client Meetings - Formal events
  clientMeetings: defineTable({
    clientId: v.id("clients"),
    userId: v.string(),
    scheduledAt: v.number(),
    type: v.union(
      v.literal("in_office"),
      v.literal("remote"),
      v.literal("client_office")
    ),
    location: v.optional(v.string()),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("cancelled")
    ),
    outcome: v.optional(
      v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative")
      )
    ),
    notes: v.optional(v.string()),
    brief: v.optional(v.string()),
    finishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_user", ["userId"])
    .index("by_meeting_date", ["scheduledAt"])
    .index("by_meeting_status", ["status"])
    .index("by_type", ["type"])
    .index("by_user_and_scheduled", ["userId", "scheduledAt"]),

  // Client Interactions - Calls, emails, quick touches
  clientInteractions: defineTable({
    clientId: v.id("clients"),
    userId: v.string(),
    type: v.union(v.literal("call"), v.literal("email")),
    scheduledAt: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("missed"),
      v.literal("no_response")
    ),
    outcome: v.optional(
      v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative")
      )
    ),
    notes: v.optional(v.string()),
    finishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_user", ["userId"])
    .index("by_contact_date", ["scheduledAt"])
    .index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_user_and_scheduled", ["userId", "scheduledAt"]),

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

  projects: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    projectType: projectTypeValidator,
    price: v.number(),
    paymentMethod: paymentMethodValidator,
    estimatedTimeline: v.number(),
    scope: v.string(),
    notes: v.optional(v.string()),
    status: projectStatusValidator,
    features: v.array(v.string()),
    salesPersonId: v.string(),
    paidInFull: v.optional(v.boolean()),
    initialPaymentAt: v.optional(v.number()),
    lastPaymentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_project_type", ["projectType"])
    .index("by_client_status", ["clientId", "status"])
    .index("by_client_paid_in_full", ["clientId", "paidInFull"]),

  payments: defineTable({
    projectId: v.id("projects"),
    clientId: v.id("clients"),
    amount: v.number(),
    paymentMethod: paymentMethodValidator,
    taxAmount: v.number(),
    discountAmount: v.optional(v.number()),
    paymentStatus: v.union(v.literal("paid"), v.literal("refunded")),
    paymentDate: v.number(),
    notes: v.optional(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.string(),
    refundedAt: v.optional(v.number()),
    refundedBy: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_client", ["clientId"])
    .index("by_client_payment_date", ["clientId", "paymentDate"])
    .index("by_payment_date", ["paymentDate"]),

  clientCollaborators: defineTable({
    clientId: v.id("clients"),
    userId: v.string(),
    addedBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_user", ["userId"])
    .index("by_client_and_user", ["clientId", "userId"]),
})
