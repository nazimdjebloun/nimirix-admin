/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as email from "../email.js";
import type * as http from "../http.js";
import type * as sales_actionCenter_mutations from "../sales/actionCenter/mutations.js";
import type * as sales_actionCenter_queries from "../sales/actionCenter/queries.js";
import type * as sales_admin_mutations from "../sales/admin/mutations.js";
import type * as sales_admin_queries from "../sales/admin/queries.js";
import type * as sales_aggregates from "../sales/aggregates.js";
import type * as sales_dashboard_mutations from "../sales/dashboard/mutations.js";
import type * as sales_dashboard_queries from "../sales/dashboard/queries.js";
import type * as sales_interactions_mutations from "../sales/interactions/mutations.js";
import type * as sales_interactions_queries from "../sales/interactions/queries.js";
import type * as sales_meetings_mutations from "../sales/meetings/mutations.js";
import type * as sales_meetings_queries from "../sales/meetings/queries.js";
import type * as sales_migrations from "../sales/migrations.js";
import type * as sales_pipeline_mutations from "../sales/pipeline/mutations.js";
import type * as sales_pipeline_queries from "../sales/pipeline/queries.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  email: typeof email;
  http: typeof http;
  "sales/actionCenter/mutations": typeof sales_actionCenter_mutations;
  "sales/actionCenter/queries": typeof sales_actionCenter_queries;
  "sales/admin/mutations": typeof sales_admin_mutations;
  "sales/admin/queries": typeof sales_admin_queries;
  "sales/aggregates": typeof sales_aggregates;
  "sales/dashboard/mutations": typeof sales_dashboard_mutations;
  "sales/dashboard/queries": typeof sales_dashboard_queries;
  "sales/interactions/mutations": typeof sales_interactions_mutations;
  "sales/interactions/queries": typeof sales_interactions_queries;
  "sales/meetings/mutations": typeof sales_meetings_mutations;
  "sales/meetings/queries": typeof sales_meetings_queries;
  "sales/migrations": typeof sales_migrations;
  "sales/pipeline/mutations": typeof sales_pipeline_mutations;
  "sales/pipeline/queries": typeof sales_pipeline_queries;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
  aggregatePipeline: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregatePipeline">;
  aggregatePipelineBySalesPerson: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregatePipelineBySalesPerson">;
  aggregateInteractionsByUser: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateInteractionsByUser">;
  aggregateMeetingsByUser: import("@convex-dev/aggregate/_generated/component.js").ComponentApi<"aggregateMeetingsByUser">;
};
