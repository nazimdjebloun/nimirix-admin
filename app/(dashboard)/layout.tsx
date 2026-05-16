// app/dashboard/layout.tsx
import {  preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProvider } from "@/context/user-context";
import { RoleGuard } from "@/lib/auth/role-guard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Preload for client components that need it
  const preloadedUserQuery = await preloadAuthQuery(api.users.getCurrentUser);
  
  return (
    <UserProvider preloadedUserQuery={preloadedUserQuery}>
      <RoleGuard />
      <SidebarProvider>
        <AppSidebar
          preloadedUserQuery={preloadedUserQuery} 
         />
        <SidebarInset className="bg-muted/50 overflow-hidden">
          <div className="flex flex-1 flex-col gap-4 p-2 min-w-0">
            <SidebarTrigger />
            <div className="min-h-screen flex-1 rounded-xl bg-background border border-border/50 md:min-h-min p-6 min-w-0">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  );
}