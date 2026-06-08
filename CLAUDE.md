# Solution Evaluation Scorecard

Next.js 15 (App Router) + TypeScript app for scoring and comparing solutions
against weighted criteria.

## Stack

- **Next.js 15** (App Router, React 19)
- **TypeScript** (strict)
- **Tailwind CSS 3** — design tokens in `tailwind.config.ts`, primitives in `app/globals.css`
- **Prisma ORM** (PostgreSQL)
- **Zod** — input validation in `lib/validation.ts`
- **Vitest** — unit tests (co-located `*.test.ts`)

## Project structure

- `app/` — pages and API routes (route handlers under `app/api/`)
- `components/` — reusable React UI (`Navbar`, `Footer`)
- `domain/` — pure, dependency-free business logic (e.g. `scoring.ts`). Unit-tested in isolation.
- `lib/` — shared utilities: Prisma singleton (`prisma.ts`), `cn` helper, Zod schemas
- `contexts/` — React context providers (`ThemeContext`)
- `prisma/` — `schema.prisma` and `seed.ts`

## Setup

1. `cp .env.example .env` and set `DATABASE_URL`
2. `npm install`
3. `npm run db:push` then `npm run db:seed`
4. `npm run dev`

## Scripts

- `npm run dev` / `build` / `start` — Next.js
- `npm run typecheck` — `tsc --noEmit`
- `npm test` / `npm run test:watch` — Vitest
- `npm run db:generate` — generate Prisma client
- `npm run db:push` — push schema to the database (no migration history)
- `npm run db:migrate` — create and apply a dev migration
- `npm run db:seed` — seed sample criteria and solutions
- `npm run db:studio` — open Prisma Studio

## Conventions

- Keep business logic in `domain/` pure (no DB/React/network) so it stays unit-testable.
- Validate all external input with the Zod schemas in `lib/validation.ts`.
- Import via the `@/*` path alias (e.g. `@/lib/prisma`).
