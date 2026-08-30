<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:prisma-rules -->

## Prisma / Database

- Prisma ORM v6 (stable) is pinned: `prisma@6` + `@prisma/client@6`. Do NOT use `prisma@latest` — it currently resolves to a Prisma 8 RC with a different CLI (no `validate`/`migrate dev` commands). If a Prisma upgrade is wanted, do it deliberately and verify the CLI.
- Schema: `prisma/schema.prisma` (PostgreSQL). Data models: User/Profile, Course, Class, Enrollment, Session, Attendance, Assignment, Submission.
- Content models (Course, Class, Session, Assignment) carry `createdBy`/`updatedBy` audit FKs in addition to `createdAt`/`updatedAt`.
- Workflow: `npm run db:migrate` (dev), `npm run db:seed` (idempotent seed via `prisma/seed.ts`, run with `tsx`), `npm run db:studio`.
- DB connection comes from `DATABASE_URL` in `.env` (git-ignored).

<!-- END:prisma-rules -->

<!-- BEGIN:nextjs-web-rules -->

## Web App (Next.js App Router + Tailwind)

- Tailwind **v4** is installed (`tailwindcss` + `@tailwindcss/postcss`). No `tailwind.config.js` needed — it's configured in `postcss.config.mjs` and imported via `@import "tailwindcss"` in `src/app/globals.css`. Add theme tokens with `@theme {}` in globals.css (v4), not a config file.
- **v16 gotcha**: `next/server` does NOT export `Response` — use `NextResponse` (e.g. `NextResponse.json(...)`). Route handlers live in `app/**/route.ts`.
- `params` and `searchParams` on Server Components are **async** (`Promise<...>`) — `await` them. Pages/controls that read `searchParams` must be wrapped in `<Suspense>` (a server wrapper can `await` them; a client `useSearchParams` component needs `<Suspense>` at the usage site).
- The `/dashboard` section uses a fixed left `Sidebar` (`src/components/layout/Sidebar.tsx`, client, via `usePathname`). Data reads via Prisma live in `src/lib/roster.ts` (server-only). The attendance toggle is a client component calling the mock endpoint `POST /api/attendance`.

<!-- END:nextjs-web-rules -->

<!-- BEGIN:attendance-api-rules -->

## Attendance API (NestJS, Clean Architecture)

- A NestJS backend module lives in `attendance-api/` (isolated from the Next.js web build: excluded from the root `tsconfig.json` and from Next's ESLint).
- Structure follows Clean Architecture — 4 layers, dependencies point inward:
  - `src/domain` — entities + repository **interfaces** + domain exceptions (no framework imports).
  - `src/application` — use cases (`mark-attendance.use-case.ts`) + DI tokens (`ATTENDANCE_REPOSITORY`, `ATTENDANCE_CLOCK`).
  - `src/infrastructure` — `PrismaService` + `PrismaAttendanceRepository` (implements the domain port) + mappers.
  - `src/presentation` — `attendance.controller.ts`, HTTP DTOs, response mapper, domain-error filter.
- **DI**: interfaces are injected via Symbol tokens because a TS interface erases at runtime. The module binds `{ provide: ATTENDANCE_REPOSITORY, useClass: PrismaAttendanceRepository }`.
- **Build/run**: `npm run api:build` (tsc → `attendance-api/dist/`), then `npm run api:start` (`node dist/main.js`). ⚠️ Run via `tsc` output, NOT `tsx` — esbuild does not emit decorator metadata, so NestJS cannot resolve class-type dependencies under `tsx`.
- The module reuses the shared Prisma schema (`@prisma/client`); its `main.ts` boots `AttendanceModule` and exposes `POST /attendance` (default port 3001).

<!-- END:attendance-api-rules -->
