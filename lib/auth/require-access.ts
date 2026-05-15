  // lib/auth/require-access.ts
  import { cache } from "react";
  import { redirect } from "next/navigation";
  import { fetchAuthQuery } from "@/lib/auth-server";
  import { api } from "@/convex/_generated/api";
  import { Doc } from "@/convex/betterAuth/_generated/dataModel";
  import { Role } from "./roles";
  import { getRoleRedirect } from "./page-access";


  export const getCurrentUser = cache(async () => {
    console.log("[getCurrentUser] FETCHING from Convex"); // This only logs on real calls
    try {
      return await fetchAuthQuery(api.users.getCurrentUser);
    } catch {
      return null;
    }
  });

  export async function requireAccess(roles: Role[], existingUser?: Doc<"user"> | null) {
    const user = existingUser ?? await getCurrentUser();
    if (!user) redirect("/login");
    
    const userRole = (user.role as Role) ?? "user";
    
    if (userRole === "admin") return user;
    if (roles.length === 0) return user;
    if (!roles.includes(userRole)) {
      redirect(getRoleRedirect(userRole));
    }
    
    return user;
  }