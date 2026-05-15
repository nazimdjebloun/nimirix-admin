"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

import { sidebarGroups } from "./sidebar-config"
import { Role } from "@/lib/auth/roles"
import { UserMenu } from "./user-menu"
import { useUser } from "@/context/user-context";
import { isRoleAllowedOnRoute } from "@/lib/auth/page-access";
import type { Preloaded } from "convex/react";
import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import { api } from "@/convex/_generated/api";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  preloadedUserQuery: Preloaded<typeof api.users.getCurrentUser>
}

export function AppSidebar({ preloadedUserQuery, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  // 1. Get user from preloaded data (available immediately on first render)
  const preloadedUser = usePreloadedAuthQuery(preloadedUserQuery);

  // 2. Get user from context (available after client-side sync)
const contextUser = useUser();
const user = preloadedUser
  // Use the context user if it exists, otherwise fallback to the preloaded one
  // This ensures we always have a user object without a loading state.
  //const user = contextUser || preloadedUser;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="flex items-center gap-5">
              <Link href="/">
                <div className="flex aspect-square  p-1 size-8 items-center justify-center rounded-lg bg-white">
                  <Image
                    src="/logo.svg"
                    height={30}
                    width={30}
                    alt="logo"
                    className="rounded-sm"
                  />
                </div>
                {!collapsed && <span className="text-lg font-bold tracking-tight">Nimirix</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sidebarGroups.map((group) => {
          const items = group.items.map((item) => {
            const currentRole = (user?.role as Role) || "user";
            const isAllowed = isRoleAllowedOnRoute(currentRole, item.href);
            return { ...item, isAllowed };
          });

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    const isAllowed = item.isAllowed

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild={isAllowed}
                          isActive={isActive}
                          disabled={!isAllowed}
                          tooltip={item.label}
                          className="data-[active=true]:bg-zinc-900 data-[active=true]:text-zinc-50 dark:data-[active=true]:bg-white dark:data-[active=true]:text-zinc-950 data-[active=true]:font-semibold"
                        >
                          {isAllowed ? (
                            <Link href={item.href}>
                              <Icon size={18} />
                              {!collapsed && <span>{item.label}</span>}
                            </Link>
                          ) : (
                            <>
                              <Icon size={18} />
                              {!collapsed && <span>{item.label}</span>}
                            </>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter>
        {user && <UserMenu user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
