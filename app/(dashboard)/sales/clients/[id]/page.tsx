import { requireRouteAccess } from "@/lib/auth/require-access"
import { access } from "@/lib/auth/page-access"
import { Id } from "@/convex/_generated/dataModel"
import { ClientDetailView } from "@/components/sales/clients/client-detail-view"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailPage({ params }: PageProps) {
  await requireRouteAccess(access.salesClients.route)
  const resolvedParams = await params
  const clientId = resolvedParams.id as Id<"clients">

  return <ClientDetailView clientId={clientId} />
}
