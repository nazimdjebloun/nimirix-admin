import { requireRouteAccess } from "@/lib/auth/require-access"
import { access } from "@/lib/auth/page-access"
import { Id } from "@/convex/_generated/dataModel"
import { ClientPayementDetail } from "@/components/payements/client-payement-detail"

interface PageProps {
  params: Promise<{
    clientId: Id<"clients">
  }>
}

export default async function ClientPayementPage({ params }: PageProps) {
  await requireRouteAccess(access.adminPayements.route)

  const resolvedParams = await params
  const clientId = resolvedParams.clientId

  return <ClientPayementDetail clientId={clientId} />
}
