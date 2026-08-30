/**
 * ATTENDANCE DOMAIN ENTITY
 * ------------------------------------------------------------------
 * Core (Domain) layer — no NestJS, no Prisma, no framework imports.
 *
 * This is the business object of the Attendance aggregate. It owns the
 * invariants of attendance and exposes behaviour (markPresent / markLate /
 * markAbsent / checkOut) instead of letting callers set state directly.
 *
 * The entity is a "rich" object: construction happens via static factories
 * so an invalid attendance can never be instantiated.
 */

import {
  AttendanceClosedError,
  CheckOutNotAllowedError,
} from '../exceptions/attendance.errors';

/**
 * Mirrors the Prisma `AttendanceStatus` enum value-for-value so the
 * persistence layer can map between the two without conversion logic.
 */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
}

/** Plain data shape used to rehydrate/persist the entity (anti-corruption). */
export interface AttendanceData {
  id: string;
  sessionId: string;
  enrollmentId: string;
  status: AttendanceStatus;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  note: string | null;
}

export class Attendance {
  readonly id: string;
  readonly sessionId: string;
  readonly enrollmentId: string;

  private _status: AttendanceStatus;
  private _checkInAt: Date | null;
  private _checkOutAt: Date | null;
  private _note: string | null;

  private constructor(data: AttendanceData) {
    this.id = data.id;
    this.sessionId = data.sessionId;
    this.enrollmentId = data.enrollmentId;
    this._status = data.status;
    this._checkInAt = data.checkInAt;
    this._checkOutAt = data.checkOutAt;
    this._note = data.note;
  }

  /** Build an entity from already-persisted data (repository → domain). */
  static rehydrate(data: AttendanceData): Attendance {
    return new Attendance(data);
  }

  /** Create a brand-new attendance for a (session, enrollment) pair. */
  static create(input: {
    id: string;
    sessionId: string;
    enrollmentId: string;
    status: AttendanceStatus;
    now: Date;
  }): Attendance {
    const entity = new Attendance({
      id: input.id,
      sessionId: input.sessionId,
      enrollmentId: input.enrollmentId,
      status: input.status,
      checkInAt: null,
      checkOutAt: null,
      note: null,
    });
    // An absentee has no physical check-in time.
    if (input.status !== AttendanceStatus.ABSENT) {
      entity._checkInAt = input.now;
    }
    return entity;
  }

  // ---- Read-only projections --------------------------------------------
  get status(): AttendanceStatus {
    return this._status;
  }
  get checkInAt(): Date | null {
    return this._checkInAt;
  }
  get checkOutAt(): Date | null {
    return this._checkOutAt;
  }
  get note(): string | null {
    return this._note;
  }
  /** True when the student was physically present (on time or late). */
  get isPresent(): boolean {
    return this._status === AttendanceStatus.PRESENT || this._status === AttendanceStatus.LATE;
  }
  get isClosed(): boolean {
    return this._checkOutAt !== null;
  }

  // ---- Behaviour (state transitions with invariants) ---------------------

  /** Mark the student present; stamps check-in with the provided time. */
  markPresent(at: Date, note: string | null = null): void {
    this._assertNotClosed();
    this._status = AttendanceStatus.PRESENT;
    this._checkInAt = at;
    this._note = note;
  }

  /** Mark the student late; stamps check-in with the provided time. */
  markLate(at: Date, note: string | null = null): void {
    this._assertNotClosed();
    this._status = AttendanceStatus.LATE;
    this._checkInAt = at;
    this._note = note;
  }

  /** Mark the student absent; clears any physical check-in/out times. */
  markAbsent(note: string | null = null): void {
    this._status = AttendanceStatus.ABSENT;
    this._checkInAt = null;
    this._checkOutAt = null;
    this._note = note;
  }

  /** Close the attendance by recording the check-out time. */
  checkOut(at: Date): void {
    if (!this.isPresent) {
      throw new CheckOutNotAllowedError('ABSENT');
    }
    if (this._checkInAt === null) {
      throw new CheckOutNotAllowedError('NO_CHECK_IN');
    }
    if (at.getTime() < this._checkInAt.getTime()) {
      throw new CheckOutNotAllowedError('BEFORE_CHECK_IN');
    }
    this._checkOutAt = at;
  }

  /** Update only the free-form note, leaving the status untouched. */
  setNote(note: string | null): void {
    this._note = note;
  }

  // ---- Persistence projection -------------------------------------------
  toData(): AttendanceData {
    return {
      id: this.id,
      sessionId: this.sessionId,
      enrollmentId: this.enrollmentId,
      status: this._status,
      checkInAt: this._checkInAt,
      checkOutAt: this._checkOutAt,
      note: this._note,
    };
  }

  // ---- Invariants --------------------------------------------------------
  private _assertNotClosed(): void {
    if (this.isClosed) {
      throw new AttendanceClosedError();
    }
  }
}