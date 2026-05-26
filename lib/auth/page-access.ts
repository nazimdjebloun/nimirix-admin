  // lib/auth/page-access.ts
  import { Role } from "./roles";
  import { redirect } from "next/navigation";
  export const access = {
    // Admin
    adminCentral:                              { route: "/central",                    roles: ["admin"] },
    adminUsers:                              { route: "/users",                        roles: ["admin"] },
    adminSettings:                          { route: "/settings",                    roles: ["admin"] },
    adminPayements:                        { route: "/payements",                  roles: ["admin"] },
    // Sales
    adminSalesDashboard:             { route: "/sales/admin-dashboard",            roles: ["leadSales", "admin"] },
    salesDashboard:                       { route: "/sales/dashboard",                         roles: ["sales", "leadSales", "admin"] },
    salesPipeline:                            { route: "/sales/pipeline",                             roles: ["sales", "leadSales", "admin"] },
    salesClients:                              { route: "/sales/clients",                    roles: ["sales", "leadSales", "admin"] },
    // Product
    adminProductDashboard:         { route: "/product/admin-dashboard",          roles: ["leadProductManager", "admin"] },
    productDashboard:                   { route: "/product/dashboard",                roles: ["productManager", "leadProductManager", "admin"] },
    productProjects:                        { route: "/product/projects",        roles: ["productManager", "leadProductManager", "admin"] },
    // Dev
    adminDevDashboard:                { route: "/dev/admin-dashboard",     roles: ["leadDev", "admin"] },
    devDashboard:                           { route: "/dev/dashboard",           roles: ["dev", "leadDev", "admin"] },
    // Design
    adminDesignDashboard:            { route: "/design/admin-dashboard",  roles: ["leadDesigner", "admin"] },
    designDashboard:                       { route: "/design/dashboard",        roles: ["designer", "leadDesigner", "admin"] },
    // QA
    adminQaDashboard:                   { route: "/qa/admin-dashboard",      roles: ["leadQa", "admin"] },
    qaDashboard:                              { route: "/qa/dashboard",            roles: ["qa", "leadQa", "admin"] },
    // DevOps
    adminDevopsDashboard:            { route: "/devops/admin-dashboard",  roles: ["leadDevops", "admin"] },
    devopsDashboard:                       { route: "/devops/dashboard",        roles: ["devops", "leadDevops", "admin"] },
    // Support
    support:                                         { route: "/support",                 roles: [] as Role[] },
  } as const satisfies Record<string, { route: string; roles: Role[] }>

  // Single source of truth: role → their home entry in accessMap
  const roleHomeEntry: Record<Role, keyof typeof access> = {
    admin:              "adminCentral",
    sales:              "salesDashboard",
    leadSales:          "adminSalesDashboard",
    productManager:     "productDashboard",
    leadProductManager: "adminProductDashboard",
    dev:                "devDashboard",  
    leadDev:            "adminDevDashboard",
    designer:           "designDashboard",
    leadDesigner:       "adminDesignDashboard",
    qa:                 "qaDashboard",
    leadQa:             "adminQaDashboard",
    devops:             "devopsDashboard",
    leadDevops:         "adminDevopsDashboard",
    user:               "support",
  }

  export function getRoleRedirect(role?: string | null): string {
    const entry = roleHomeEntry[role as Role];
    return entry ? access[entry].route : "/support";
  }

export function redirectToDefaultRoute(role?: string | null): never {
 redirect(getRoleRedirect(role));
}


  export function isRoleAllowedOnRoute(role: Role, pathname: string): boolean {
    if (role === "admin") return true;
    const match = Object.values(access).find(entry => entry.route === pathname);
    if (!match || match.roles.length === 0) return true;
    return (match.roles as Role[]).includes(role);
  }


export function redirectIfDisallowedRoute(role: Role, pathname: string): void {
  if (role === "admin") return;

  const match = Object.values(access).find((entry) => entry.route === pathname);
  if (!match || match.roles.length === 0) return;

  if (!(match.roles as Role[]).includes(role)) {
    redirect(getRoleRedirect(role));
  }
}
