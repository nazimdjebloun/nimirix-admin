import { SalesPipeline } from "@/components/sales/pipeline/sales-pipeline";
import { requireRouteAccess } from "@/lib/auth/require-access";
import { access } from "@/lib/auth/page-access";

export default async function GlobalPipelinePage() {
  await requireRouteAccess(access.salesPipeline.route);
  return <SalesPipeline />;
}
