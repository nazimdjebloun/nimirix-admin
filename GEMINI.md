# Project Guidelines

## Middleware / Proxy
- **`middleware.ts` is DEPRECATED.** 
- Do NOT search for or create `middleware.ts`.
- The middleware logic for this project is located in **`proxy.ts`**.
- All authentication and role-based redirection must be handled in `proxy.ts`.

## Auth Helpers
- Use `isRoleAllowedOnRoute` and `getRoleRedirect` from `lib/auth/page-access.ts` for all redirection logic.
