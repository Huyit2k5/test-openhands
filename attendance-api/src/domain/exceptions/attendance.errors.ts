/**
 * DOMAIN EXCEPTIONS
 * ------------------------------------------------------------------
 * Business-rule violations raised by the Domain layer (entities / value
 * objects). These are framework-agnostic: the Presentation layer maps them
 * to HTTP status codes, the Domain never knows about HTTP.
 *
 * A stable `code` string lets clients (and the controller) react to a specific
 * rule violation without string-matching the human-readable message.
 */
export class AttendanceDomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AttendanceDomainError';
  }
}

/** A present/late attendance was already closed via check-out. */
export class AttendanceClosedError extends AttendanceDomainError {
  constructor() {
    super('Attendance has already been checked out and cannot be re-marked.', 'ATTENDANCE_CLOSED');
    this.name = 'AttendanceClosedError';
  }
}

/** Check-out was requested on a record that does not allow it. */
export class CheckOutNotAllowedError extends AttendanceDomainError {
  constructor(reason: 'ABSENT' | 'NO_CHECK_IN' | 'BEFORE_CHECK_IN') {
    const message =
      reason === 'ABSENT'
        ? 'Cannot check out an absent student.'
        : reason === 'NO_CHECK_IN'
          ? 'Cannot check out without a recorded check-in time.'
          : 'Check-out time must not be earlier than the check-in time.';
    super(message, 'CHECK_OUT_NOT_ALLOWED');
    this.name = 'CheckOutNotAllowedError';
  }
}