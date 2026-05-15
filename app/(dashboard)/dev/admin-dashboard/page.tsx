import { DevAdminDashboard } from "@/components/dev/admin-dashboard/dev-admin-dashboard";

export default function GlobalDevHealthPage() {
  return <DevAdminDashboard />;
}


// "use client";

// import { useUser } from "@/context/user-context";
// import { usePathname, useRouter } from "next/navigation";
// import { isRoleAllowedOnRoute, getRoleRedirect } from "@/lib/auth/page-access";
// import { DevAdminDashboard } from "@/components/dev/admin-dashboard/dev-admin-dashboard";
// import type { Role } from "@/lib/auth/roles";
// import { useEffect } from "react";

// export default function GlobalDevHealthPage() {
//   const user = useUser();
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     if (user) {
//       const role = (user.role as Role) || "user";
//       if (!isRoleAllowedOnRoute(role, pathname)) {
//         router.push(getRoleRedirect(role));
//       }
//     }
//   }, [user, pathname, router]);

//   if (!user) {
//     return (
//       <div className="flex h-[50vh] w-full items-center justify-center">
//         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
//       </div>
//     );
//   }

//   const role = (user.role as Role) || "user";
//   if (!isRoleAllowedOnRoute(role, pathname)) {
//     return null;
//   }

//   return <DevAdminDashboard />;
// }
