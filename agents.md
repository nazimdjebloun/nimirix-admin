# Project Guidelines
## Middleware / Proxy
- **`middleware.ts` is DEPRECATED.** 
- Do NOT search for or create `middleware.ts`.
- The middleware logic for this project is located in **`proxy.ts`**.
- All authentication and role-based redirection must be handled in `proxy.ts`.

## Auth Helpers
- Use `isRoleAllowedOnRoute` and `getRoleRedirect` from `lib/auth/page-access.ts` for all redirection logic.

## Interaction Rules
- **NEVER ASSUME.** Do exactly as the user says and nothing more.
- Never jump to conclusions or expand the scope of a task to other files unless explicitly requested.
- If you feel an assumption is necessary, **ASK** the user before proceeding.
- When the user asks a question, **answer it first.** Do not jump straight to code unless explicitly asked to implement something.
- **A question is not a command.** If the user asks "should I…" or "what if…" or "how would…", respond with an answer — do not go edit files or write implementation code.
- **If unsure which file to edit, ask before touching anything.**
- **Only edit the file explicitly specified.** Do not modify any other file without explicit approval, even if it seems related or necessary.
- **If the request is vague or missing context, ask clarifying questions** before doing anything. Do not interpret or fill in gaps on your own.
- The rule is simple: **do exactly what is asked, nothing more, nothing less.**

## Code Quality
- **Never use `any`.** All types must be explicit and accurate.
- Enforce strict TypeScript type safety throughout the codebase.
- If a type is unknown or unclear, ask — do not fall back to `any`.