"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import type { Preloaded } from "convex/react";

// undefined = loading, null = no user, Doc = user found
const UserContext = createContext<Doc<"user"> | null | undefined>(undefined);

export function UserProvider({ 
  preloadedUserQuery, 
  children 
}: { 
  preloadedUserQuery: Preloaded<typeof api.users.getCurrentUser>, 
  children: ReactNode 
}) {
  // We use the preloaded query here to initialize the context instantly.
  // This removes the "loading" state from the entire app.
  const user = usePreloadedAuthQuery(preloadedUserQuery);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  const user = useContext(UserContext);
 //  console.log("[USER CONTEXT] receiving user from preloaded query", user);
  // We don't throw anymore because we want to allow components to handle the loading state
  return user;
}