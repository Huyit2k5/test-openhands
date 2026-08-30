/**
 * APPLICATION DI TOKENS
 * ------------------------------------------------------------------
 * Injection tokens for non-repository application dependencies.
 *
 * ATTENDANCE_CLOCK: a `() => Date` factory so use cases never call `new Date()`
 * directly. This keeps them deterministic in tests (inject a fixed date) while
 * production supplies `() => new Date()`. Inject it with `@Inject(ATTENDANCE_CLOCK)`.
 *
 * ATTENDANCE_REPOSITORY: token that stands in for the `AttendanceRepository`
 * *interface*. Because a TypeScript interface erases at runtime, NestJS cannot
 * use the interface type directly as an injection token (it would collapse to
 * `Object` under `emitDecoratorMetadata`). A stable Symbol token solves this:
 *   - the Application injects the abstraction via `@Inject(ATTENDANCE_REPOSITORY)`
 *   - the Module binds that token to the concrete Prisma implementation
 *     (`{ provide: ATTENDANCE_REPOSITORY, useClass: PrismaAttendanceRepository }`)
 */
export const ATTENDANCE_CLOCK = Symbol('ATTENDANCE_CLOCK');
export const ATTENDANCE_REPOSITORY = Symbol('ATTENDANCE_REPOSITORY');