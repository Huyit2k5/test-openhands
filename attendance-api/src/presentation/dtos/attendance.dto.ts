/**
 * ATTENDANCE HTTP DTOs (Presentation)
 * ------------------------------------------------------------------
 * Request/response shapes for the Attendance REST API. These are the only
 * types the outside world sees. They are deliberately separate from the
 * application-layer use-case DTOs so that:
 *   - the HTTP contract can evolve independently of the use cases, and
 *   - transport concerns (status string casing, ISO date serialization)
 *     stay at the edge of the system.
 */
import {
  AttendanceStatus,
} from '../../domain/entities/attendance.entity';

/**
 * Body for `POST /attendance`.
 * `status` must be one of the `AttendanceStatus` enum values
 * (PRESENT | LATE | ABSENT).
 */
export class MarkAttendanceDto {
  sessionId!: string;
  enrollmentId!: string;
  status!: AttendanceStatus;
  note?: string;
}

/** JSON snapshot of a persisted attendance, returned in HTTP responses. */
export class AttendanceResponseDto {
  id!: string;
  sessionId!: string;
  enrollmentId!: string;
  status!: AttendanceStatus;
  checkInAt!: string | null;
  checkOutAt!: string | null;
  note!: string | null;
}