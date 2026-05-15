import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"
import { ac,   admin,
  productManager,
  dev,
  designer,
  qa,
  devops,
  sales,
  user,
  leadProductManager,
  leadDev,
  leadDesigner,
  leadQa,
  leadDevops,
  leadSales,
} from "@/convex/betterAuth/permissions"

export const authClient = createAuthClient({
  plugins: [
    convexClient(), 
    adminClient({
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
    })
  ],
});

export const client = authClient;
export type SessionType = typeof authClient.$Infer.Session.session
export type UserType = typeof authClient.$Infer.Session.user