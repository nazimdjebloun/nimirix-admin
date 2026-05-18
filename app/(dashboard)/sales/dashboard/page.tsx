import { SalesDashboard } from "@/components/sales/dashboard/sales-dashboard";
import { requireRouteAccess } from "@/lib/auth/require-access";
import { access } from "@/lib/auth/page-access";

export default async function SalesDashboardPage() {
  await requireRouteAccess(access.salesDashboard.route);
  return <SalesDashboard />;
}
