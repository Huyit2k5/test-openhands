/**
 * ATTENDANCE REPOSITORY — ABSTRACT PORT
 * ------------------------------------------------------------------
 * Core (Domain) layer. This is the boundary between the Application
 * (use cases) and the persistence world. It is expressed purely in terms of
 * domain language — no Prisma types, no database primitives leak through.
 *
 * The Application depends on THIS interface. The Infrastructure layer
 * provides the concrete Prisma-backed implementation, and the concrete class
 * is wired in via NestJS dependency injection at composition time. This is
 * what keeps the dependency rule intact: outer layers depend on inner layers.
 */

import { Attendance } from '../entities/attendance.entity';

export interface AttendanceRepository {
  /**
   * Load a single attendance by its primary key.
   * @returns the hydrated entity, or `null` when no such record exists.
   */
  findById(id: string): Promise<Attendance | null>;

  /**
   * Load every attendance recorded for a given session (one per enrollment).
   */
  findBySessionId(sessionId: string): Promise<Attendance[]>;

  /**
   * Load the attendance for a specific enrollment within a specific session.
   * The (sessionId, enrollmentId) pair is unique, so this returns at most one
   * record. Used by the mark-attendance use case to locate the record before
   * upserting.
   */
  findBySessionAndEnrollment(sessionId: string, enrollmentId: string): Promise<Attendance | null>;

  /**
   * Persist an attendance, inserting a new row or updating the existing one
   * for the same (sessionId, enrollmentId) pair. The unique constraint
   * `@@unique([sessionId, enrollmentId])` on the `attendances` table makes
   * this a true upsert, so marking attendance is idempotent per student.
   */
  save(attendance: Attendance): Promise<Attendance>;
}