import { AdminUsers } from "@/components/admin/users/admin-users";
import { requireRouteAccess } from "@/lib/auth/require-access";
import { access } from "@/lib/auth/page-access";

export default async function UserManagementPage() {
  await requireRouteAccess(access.adminUsers.route);

  return <AdminUsers />;
}