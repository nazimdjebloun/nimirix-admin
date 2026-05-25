# Project Guidelines

1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

    State your assumptions explicitly. If uncertain, ask.
    If multiple interpretations exist, present them - don't pick silently.
    If a simpler approach exists, say so. Push back when warranted.
    If something is unclear, stop. Name what's confusing. Ask.

2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

    No features beyond what was asked.
    No abstractions for single-use code.
    No "flexibility" or "configurability" that wasn't requested.
    No error handling for impossible scenarios.
    If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify. 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

    Don't "improve" adjacent code, comments, or formatting.
    Don't refactor things that aren't broken.
    Match existing style, even if you'd do it differently.
    If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

    Remove imports/variables/functions that YOUR changes made unused.
    Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

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

## File & Component Structure

- **Never put everything in one file.** Each component, hook, utility, and type must live in its own dedicated file.
- **One component per file.** No exceptions. If you're tempted to define a second component in the same file, stop and create a new file.
- **Page files are thin.** A page component (`app/**/page.tsx`) must only compose components — no business logic, no data fetching logic, no inline type definitions.
- **If a file is getting long, it's already wrong.** Split it before it becomes a problem. Do not wait to be told.
- **Never co-locate unrelated logic.** If two things don't belong together conceptually, they don't belong in the same file.

## Component & Library Structure

- **Components are scoped to their page.** All components for a given page live in `components/<page-name>/`. One component per file.
- **Logic is scoped to its page.** All utilities, helpers, and lib code for a given page live in `lib/<page-name>/`. Do not dump page-specific logic anywhere else.
- **Hooks go in their own file** inside the relevant `lib/<page-name>/` or a top-level `hooks/` folder if shared.
- **Types go in a dedicated `types.ts`** inside the relevant scoped folder — never inline inside a component file.
- **Shared/reusable components go in `components/ui/` or `components/shared/`** — not inside a page-scoped folder.
- **Do not create god components.** If a component handles form state, data fetching, rendering, and routing all at once — it's wrong. Break it apart.
- **Presentational vs. container components must be separated.** A component either renders UI or manages logic — not both.
- **Props must be typed explicitly** with a named interface or type alias. Never anonymous inline objects.
