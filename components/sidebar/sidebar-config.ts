import {
  LayoutDashboard, Target, Settings, ShieldCheck, Code2,
  Cloud, Search, Layers, LineChart, Building2, UserCog,
  ClipboardCheck, Activity, Receipt, LucideIcon,
} from "lucide-react"
import { Role } from "@/lib/auth/roles"
import { access } from "@/lib/auth/page-access"

export interface SidebarItem {
  label: string
  icon: LucideIcon
  href: string
  roles: Role[]
}

export interface SidebarGroup {
  label: string
  items: SidebarItem[]
}

export const sidebarGroups: SidebarGroup[] = [

  {
    label: "Administration",
    items: [
      { label: "Master Admin Overview", icon: Activity,       href: access.adminCentral.route,         roles: [...access.adminCentral.roles] },
      { label: "User Management",        icon: UserCog,       href: access.adminUsers.route,            roles: [...access.adminUsers.roles] },
      { label: "System Settings",        icon: Settings,      href: access.adminSettings.route,         roles: [...access.adminSettings.roles] },
      { label: "Billing / Payments",     icon: Receipt,       href: access.adminPayements.route,       roles: [...access.adminPayements.roles] },
    ],
  },
  {
    label: "Sales & CRM",  
    items: [
      { label: "Global Sales Dashboard", icon: LineChart,     href: access.adminSalesDashboard.route,   roles: [...access.adminSalesDashboard.roles] },
      { label: "My Sales Dashboard",     icon: LayoutDashboard, href: access.salesDashboard.route,      roles: [...access.salesDashboard.roles] },
      { label: "Pipeline",               icon: Target,        href: access.salesPipeline.route,         roles: [...access.salesPipeline.roles] },
      { label: "Clients",                icon: Building2,     href: access.salesClients.route,          roles: [...access.salesClients.roles] },
    ],
  },
  {
    label: "Product Management",
    items: [
      { label: "Global Product Insights", icon: Layers,       href: access.adminProductDashboard.route, roles: [...access.adminProductDashboard.roles] },
      { label: "My Product Dashboard",    icon: Layers,       href: access.productDashboard.route,      roles: [...access.productDashboard.roles] },
      { label: "Project Tracker",         icon: ClipboardCheck, href: access.productProjects.route,     roles: [...access.productProjects.roles] },
    ],
  },
  {
    label: "Development",
    items: [
      { label: "Global Dev Health",      icon: Code2,         href: access.adminDevDashboard.route,     roles: [...access.adminDevDashboard.roles] },
      { label: "Development Overview",   icon: LayoutDashboard, href: access.devDashboard.route,        roles: [...access.devDashboard.roles] },
    ],
  },
  {
    label: "Design & Creative",
    items: [
      { label: "Global Design Studio",   icon: Code2,         href: access.adminDesignDashboard.route,  roles: [...access.adminDesignDashboard.roles] },
      { label: "Design Overview",        icon: Layers,        href: access.designDashboard.route,       roles: [...access.designDashboard.roles] },
    ],
  },
  {
    label: "Quality Assurance",
    items: [
      { label: "Global QA Report",       icon: ShieldCheck,   href: access.adminQaDashboard.route,      roles: [...access.adminQaDashboard.roles] },
      { label: "Quality Overview",       icon: Search,        href: access.qaDashboard.route,           roles: [...access.qaDashboard.roles] },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "System Wide Monitoring", icon: Cloud,         href: access.adminDevopsDashboard.route,  roles: [...access.adminDevopsDashboard.roles] },
      { label: "DevOps Dashboard",       icon: Settings,      href: access.devopsDashboard.route,       roles: [...access.devopsDashboard.roles] },
    ],
  },

]
