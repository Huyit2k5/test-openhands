/**
 * MARK-ATTENDANCE USE CASE (Application / Interactor)
 * ------------------------------------------------------------------
 * The orchestration step of Clean Architecture: it coordinates the Domain
 * (the `Attendance` entity) and persistence (the `AttendanceRepository` port)
 * to fulfil one business operation — "mark an enrollment's attendance for a
 * session".
 *
 * Rules observed:
 *   - Depends ONLY on the Domain entity and the domain repository interface.
 *     It has zero knowledge of Prisma, NestJS HTTP, or the database.
 *   - Uses the rich entity for state transitions (its invariants do the
 *     validation), then asks the repository to persist the outcome.
 *   - Re-marking an already-closed attendance is rejected by the entity and
 *     surfaces as a domain error, which the Presentation layer maps to HTTP.
 *
 * It is a NestJS `@Injectable()` so the container can inject the repository
 * implementation by its interface token (constructor DI).
 */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ATTENDANCE_CLOCK,
  ATTENDANCE_REPOSITORY,
} from './constants/attendance.tokens';
import {
  Attendance,
  AttendanceStatus,
} from '../domain/entities/attendance.entity';
import { AttendanceRepository } from '../domain/repositories/attendance.repository.interface';
import {
  MarkAttendanceInput,
  MarkAttendanceResult,
} from './dtos/mark-attendance.use-case.dto';

@Injectable()
export class MarkAttendance {
  private readonly logger = new Logger(MarkAttendance.name);

  /**
   * Constructor injection. `AttendanceRepository` is an *interface*, which
   * erases at runtime — so it is injected through the `ATTENDANCE_REPOSITORY`
   * Symbol token rather than the type itself. The module binds that token to
   * the concrete Prisma implementation, keeping this class decoupled from
   * infrastructure. The clock is likewise injected by token for testability.
   */
  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(ATTENDANCE_CLOCK) private readonly clock: () => Date,
  ) {}

  /**
   * Execute the "mark attendance" operation for one (session, enrollment).
   *
   * @param input command from the presentation layer
   * @returns the persisted attendance snapshot
   * @throws a domain error (from the entity) when the mark is not allowed,
   *         e.g. re-marking an attendance that has already been checked out.
   */
  async execute(input: MarkAttendanceInput): Promise<MarkAttendanceResult> {
    const now = this.clock();

    // 1) Locate the existing record (if any) for this (session, enrollment).
    const existing = await this.attendanceRepository.findBySessionAndEnrollment(
      input.sessionId,
      input.enrollmentId,
    );

    // 2) Apply the business transition through the rich entity.
    let entity: Attendance;
    if (existing) {
      // The entity's invariants guard against invalid transitions here.
      this.applyStatus(existing, input.status, input.note, now);
      entity = existing;
    } else {
      // First-time mark: create a fresh entity. `create` stamps the check-in
      // time for present/late statuses and leaves it null for absent.
      entity = Attendance.create({
        id: this.newId(),
        sessionId: input.sessionId,
        enrollmentId: input.enrollmentId,
        status: input.status,
        now,
      });
      entity.setNote(input.note);
    }

    // 3) Persist (upsert keyed on the unique (sessionId, enrollmentId)).
    const saved = await this.attendanceRepository.save(entity);

    this.logger.debug(
      `Attendance ${input.status} for enrollment ${input.enrollmentId} in session ${input.sessionId}`,
    );
    return MarkAttendanceResult.fromEntity(saved);
  }

  /** Drive the entity to the requested status, relying on its invariants. */
  private applyStatus(
    entity: Attendance,
    status: AttendanceStatus,
    note: string | null,
    now: Date,
  ): void {
    switch (status) {
      case AttendanceStatus.PRESENT:
        entity.markPresent(now, note);
        break;
      case AttendanceStatus.LATE:
        entity.markLate(now, note);
        break;
      case AttendanceStatus.ABSENT:
        entity.markAbsent(note);
        break;
      default:
        throw new Error(`Unknown attendance status: ${String(status)}`);
    }
  }

  /**
   * Id provider indirection. Kept out of the entity (Domain) so the Domain
   * layer never needs to know where identifiers come from. The default uses
   * `crypto.randomUUID`; a test can substitute a deterministic generator.
   */
  private newId(): string {
    return randomUUID();
  }
}