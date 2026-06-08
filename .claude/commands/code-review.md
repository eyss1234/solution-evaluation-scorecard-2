# Code Review Agent

Review the codebase for quality, consistency, and correctness. Run through every check below and produce a structured report.

## 1. Architecture Compliance

Check that these rules are followed:
- `/domain/**` contains ONLY pure TypeScript — no imports from `next`, `react`, `prisma`, or any framework
- All database access goes through API routes, never in client components
- API routes return consistent `{ok: true, data}` / `{ok: false, error: {message}}` shape
- Zod validation is used on all API request bodies
- No `any` types anywhere (search for `: any` and `as any`)

## 2. Database & Prisma

- Verify all Prisma queries use the singleton client from `lib/db.ts`
- Check for N+1 query risks (nested loops calling Prisma)
- Ensure cascade deletes are set correctly — deleting a Project should clean up everything
- Verify unique constraints match the schema (no duplicate score submissions, etc.)
- Check that all `findUnique` calls handle the `null` case

## 3. API Routes

For each route in `app/api/**`:
- Request body is validated with Zod before use
- Errors return proper HTTP status codes (400, 404, 500)
- All async operations are in try/catch blocks
- No sensitive data leaked in error responses
- POST/PUT/PATCH/DELETE routes don't accept GET requests (check method handling)

## 4. React & Next.js

- Server components don't use `useState`, `useEffect`, or event handlers
- Client components have the `'use client'` directive
- No data fetching in client components that should be server-side
- `useRouter` is imported from `next/navigation` (not `next/router`)
- Dynamic route params use the `Promise<>` pattern for Next.js 15
- No missing `key` props in `.map()` renders
- Forms don't use `<form>` submission without `preventDefault` where appropriate

## 5. TypeScript

- Run `npx tsc --noEmit` and report any type errors
- Check for implicit `any` types
- Verify interface/type exports are used consistently
- Ensure enums/literals match between Prisma schema and TypeScript code (CostCategory, Currency)

## 6. Security

- No API keys or secrets hardcoded (check for string literals starting with `sk-`)
- Environment variables accessed via `process.env` only on the server side
- No `dangerouslySetInnerHTML` without sanitization
- User input is validated before database operations
- Check for SQL injection risks (raw queries)

## 7. Error Handling & Edge Cases

- What happens when a project/scorecard/run doesn't exist? (should 404)
- What happens on network failure in client components? (should show error state)
- What happens with concurrent saves? (last-write-wins is acceptable, but no crashes)
- Are loading states shown during async operations?
- Are delete operations behind confirmation dialogs?

## 8. Code Quality

- No dead code or unused imports
- No `console.log` left in production code (console.error is fine for error handlers)
- Consistent naming conventions (camelCase for variables, PascalCase for components)
- No duplicated logic that should be extracted to shared utilities
- Files under 300 lines (flag anything larger for potential splitting)

## 9. Styling & UX

- Responsive: check for mobile breakpoints on all pages
- Consistent colour scheme — no random hex values outside Tailwind classes
- All interactive elements have hover/focus/disabled states
- Empty states exist for all lists (projects, scorecards, financial entries)
- Loading spinners/skeletons on all async operations

## 10. Tests

- Run `npx vitest run` and report results
- Check domain logic has test coverage (gating evaluation, score calculation, financial calculation)
- Verify edge cases are tested: empty arrays, zero scores, all-yes/all-no gating

---

## Output Format

Produce a report with these sections:

### Critical (must fix)
Issues that would cause bugs, crashes, or security problems.

### Warnings (should fix)
Code quality issues, missing error handling, accessibility gaps.

### Suggestions (nice to have)
Improvements for readability, performance, or UX polish.

### Stats
- Total files reviewed
- TypeScript errors found
- Test results (pass/fail count)
- Files over 300 lines

For each issue, include the file path, line number (if applicable), and a specific recommendation.