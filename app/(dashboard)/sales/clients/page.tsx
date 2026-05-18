import { SalesClients } from "@/components/sales/clients/sales-clients";
import { requireRouteAccess } from "@/lib/auth/require-access";
import { access } from "@/lib/auth/page-access";

export default async function ClientsPage() {
  await requireRouteAccess(access.salesClients.route);
  return <SalesClients />;
}
