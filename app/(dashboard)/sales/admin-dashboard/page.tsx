// app/sales/admin-dashboard/page.tsx

import { SalesAdminDashboard } from "@/components/sales/admin-dashboard/sales-admin-dashboard";
import { requireRouteAccess } from "@/lib/auth/require-access";
import { access } from "@/lib/auth/page-access";

export default async function SalesAdminDashboardPage() {
  await requireRouteAccess(access.salesDashboard.route);
  return <SalesAdminDashboard />;
}    
