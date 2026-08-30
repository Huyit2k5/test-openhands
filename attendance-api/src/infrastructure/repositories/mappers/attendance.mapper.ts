/**
 * ATTENDANCE MAPPER (Infrastructure)
 * ------------------------------------------------------------------
 * Anti-corruption layer between the persistence framework (Prisma) and the
 * Domain. It translates back and forth between the Prisma-generated
 * `attendance` record and the `Attendance` domain entity, so that:
 *   - the Domain never sees Prisma types, and
 *   - the Prisma schema can change shape (renamed columns, new fields) with
 *     the blast radius contained to this one file.
 *
 * The Prisma `AttendanceStatus` enum and the domain `AttendanceStatus` enum
 * match value-for-value, so the status mapping is a safe, identity cast.
 */
import type { Attendance as PrismaAttendance } from '@prisma/client';
import {
  Attendance,
  AttendanceStatus,
} from '../../../domain/entities/attendance.entity';

/** Prisma record → domain entity. */
export function toDomain(record: PrismaAttendance): Attendance {
  return Attendance.rehydrate({
    id: record.id,
    sessionId: record.sessionId,
    enrollmentId: record.enrollmentId,
    status: record.status as AttendanceStatus,
    checkInAt: record.checkInAt,
    checkOutAt: record.checkOutAt,
    note: record.note,
  });
}

/** Domain entity → Prisma write payload (write columns only). */
export function toRecord(entity: Attendance): Pick<
  PrismaAttendance,
  'id' | 'sessionId' | 'enrollmentId' | 'status' | 'checkInAt' | 'checkOutAt' | 'note'
> {
  return {
    id: entity.id,
    sessionId: entity.sessionId,
    enrollmentId: entity.enrollmentId,
    status: entity.status,
    checkInAt: entity.checkInAt,
    checkOutAt: entity.checkOutAt,
    note: entity.note,
  };
}