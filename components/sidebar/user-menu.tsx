"use client"

import {
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { UserSettingsDialog } from "../users/user-settings-dialog"
import { ThemeDropdown } from "./theme-dropdown"
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { ROLE_LABELS } from "@/lib/auth/roles";

export function UserMenu({ 
  user,
}: {
// user: Preloaded<typeof api.users.getCurrentUser>
user: Doc<"user"> 

}) {
  const { isMobile, state } = useSidebar()
  const router = useRouter()
  const collapsed = state === "collapsed"
  const [showSettings, setShowSettings] = useState(false)

const handleLogout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push("/login")
      },
    },
  })
}
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserSettingsDialog open={showSettings} onOpenChange={setShowSettings}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex items-center gap-3 p-2 h-auto"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex flex-col items-start text-left min-w-0 flex-1 overflow-hidden">
                    <span className="text-sm font-semibold truncate w-full">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {user.email}
                    </span>
                  </div>
                )}
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
              avoidCollisions
              collisionPadding={10}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.image ?? undefined} alt={user.name} />
                    <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" onSelect={() => setShowSettings(true)}>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              
            <ThemeDropdown/>
              
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </UserSettingsDialog>
        {!collapsed && (
          <div className="px-2 pb-2">
            <Badge variant="secondary" className="capitalize text-[10px] py-0 px-2 h-5">
              {ROLE_LABELS[user.role as string] || user.role}
            </Badge>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
