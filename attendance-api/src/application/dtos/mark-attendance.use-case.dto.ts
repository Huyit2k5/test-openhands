/**
 * MARK-ATTENDANCE USE-CASE — INPUT / OUTPUT (application DTOs)
 * ------------------------------------------------------------------
 * These types are the public contract of the `MarkAttendance` use case. They
 * are defined in the Application layer so that:
 *   - the Presentation layer can translate HTTP payloads into them, and
 *   - they reference only Domain vocabulary (the `AttendanceStatus` enum),
 *     never HTTP or persistence types.
 */

import {
  Attendance,
  AttendanceStatus,
} from '../../domain/entities/attendance.entity';

/** Command describing a single attendance mark for one enrollment in a session. */
export class MarkAttendanceInput {
  constructor(
    readonly sessionId: string,
    readonly enrollmentId: string,
    readonly status: AttendanceStatus,
    readonly note: string | null = null,
  ) {}
}

/** Result returned by `MarkAttendance.execute` (an attendance snapshot). */
export class MarkAttendanceResult {
  constructor(
    readonly id: string,
    readonly sessionId: string,
    readonly enrollmentId: string,
    readonly status: AttendanceStatus,
    readonly checkInAt: Date | null,
    readonly checkOutAt: Date | null,
    readonly note: string | null,
  ) {}

  static fromEntity(entity: Attendance): MarkAttendanceResult {
    return new MarkAttendanceResult(
      entity.id,
      entity.sessionId,
      entity.enrollmentId,
      entity.status,
      entity.checkInAt,
      entity.checkOutAt,
      entity.note,
    );
  }
}