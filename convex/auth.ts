    import { createClient } from "@convex-dev/better-auth";
    import { convex } from "@convex-dev/better-auth/plugins";
    import type { GenericCtx } from "@convex-dev/better-auth/utils";
import {
  betterAuth,
  type BetterAuthOptions, 
} from "better-auth/minimal";
    import { components, api } from "./_generated/api";
    import type { DataModel } from "./_generated/dataModel";
    import { MutationCtx } from "./_generated/server";
    import authConfig from "./auth.config";
import schema from "./betterAuth/schema";
    import { admin as adminPlugin } from "better-auth/plugins";
    import { ac,   admin,
      leadProductManager,
      leadDev,
      leadDesigner,
      leadQa,
      leadDevops,
      leadSales,
      productManager,
      dev,
      designer,
      qa,
      devops,
      sales,
      user} from "./betterAuth/permissions"

    // Better Auth Component
    export const authComponent = createClient<DataModel, typeof schema>(
      components.betterAuth,
      {
        local: { schema },
        verbose: false,
      },
    );

    // Better Auth Options
    export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
      return {
        appName: "Nimirix Admin",
        baseURL: process.env.SITE_URL,
        secret: process.env.BETTER_AUTH_SECRET,
        database: authComponent.adapter(ctx),
        emailAndPassword: {    
            enabled: true,
            async sendResetPassword({ user, url }) {
                // Schedule the Node.js email action asynchronously
                // Using MutationCtx for type-safe access to the scheduler
                await (ctx as unknown as MutationCtx).scheduler.runAfter(0, api.email.sendResetPassword, {
                    email: user.email,
                    url: url,
                });
            },
            revokeSessionsOnPasswordReset: true,
            resetPasswordTokenExpiresIn: 1800, // 30 minutes
        },
        plugins: [
          convex({ authConfig }),
          adminPlugin({
            defaultRole: "user",
            ac,
            roles: {
              admin,
              user,
              productManager,
              dev,
              designer,
              qa,
              devops,
              sales,
              leadProductManager,
              leadDev,
              leadDesigner,
              leadQa,
              leadDevops,
              leadSales,
          }
          }),
        ],
        rateLimit: {
            enabled: true,
            customRules: {
                "/api/auth/request-password-reset": {
                    max: 3,
                    window: 60,
                },
                "/api/auth/sign-in/email": {
                    max: 5,
                    window: 60,
                },
                "/api/auth/sign-up/email": {
                    max: 5,
                    window: 60,
                },
            }
        },
      } satisfies BetterAuthOptions;
    };


    
    // Better Auth Instance
    export const createAuth = (ctx: GenericCtx<DataModel>) => {
      return betterAuth(createAuthOptions(ctx));
    };