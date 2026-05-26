import { requireRouteAccess } from "@/lib/auth/require-access"
import { access } from "@/lib/auth/page-access"
import { PaymentsIndex } from "@/components/payements/payments-index/payments-index"

export default async function PayementsPage() {
  await requireRouteAccess(access.adminPayements.route)

  return <PaymentsIndex />
}
