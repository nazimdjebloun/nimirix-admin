    // components/auth/role-guard.tsx
    "use client";
    import { useEffect } from "react";
    import { usePathname, useRouter } from "next/navigation";
    import { isRoleAllowedOnRoute, getRoleRedirect } from "@/lib/auth/page-access";
    import { Role } from "@/lib/auth/roles";
    import { useUser } from "@/context/user-context";



    export function RoleGuard() {
      const pathname = usePathname();
      const router = useRouter();
      const user = useUser();

      useEffect(() => {
        // 1. Wait for user to load. undefined = loading
        if (user === undefined) return;

        // 2. If no user, redirect to login (immediate disconnection)
        if (user === null) {
          window.location.href = "/login";
          return;
        }

        // 3. Check role-based access
        const userRole = (user.role as Role) ?? "user";
        if (!isRoleAllowedOnRoute(userRole, pathname)) {
          const redirectPath = getRoleRedirect(userRole);
          router.push(redirectPath);
        }
      }, [user, pathname, router]);

      return null;
    }

