/**
 * ATTENDANCE REPOSITORY — PRISMA IMPLEMENTATION (Infrastructure)
 * ------------------------------------------------------------------
 * Concrete implementation of the Domain's `AttendanceRepository` port.
 * This is the only place in the module that knows Prisma exists.
 *
 * DI wiring: it is registered in the module as
 *   { provide: AttendanceRepository (interface token),
 *     useClass: PrismaAttendanceRepository }
 * so the Application layer receives it by interface and stays decoupled.
 */
import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from '../../domain/repositories/attendance.repository.interface';
import { Attendance } from '../../domain/entities/attendance.entity';
import { PrismaService } from '../prisma/prisma.service';
import { toDomain, toRecord } from './mappers/attendance.mapper';

@Injectable()
export class PrismaAttendanceRepository implements AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Attendance | null> {
    const record = await this.prisma.attendance.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findBySessionId(sessionId: string): Promise<Attendance[]> {
    const records = await this.prisma.attendance.findMany({ where: { sessionId } });
    return records.map(toDomain);
  }

  async findBySessionAndEnrollment(
    sessionId: string,
    enrollmentId: string,
  ): Promise<Attendance | null> {
    const record = await this.prisma.attendance.findUnique({
      where: { sessionId_enrollmentId: { sessionId, enrollmentId } },
    });
    return record ? toDomain(record) : null;
  }

  async save(attendance: Attendance): Promise<Attendance> {
    // Upsert keyed on the @@unique([sessionId, enrollmentId]) constraint, so
    // marking attendance for the same (session, enrollment) is idempotent.
    const record = toRecord(attendance);
    const saved = await this.prisma.attendance.upsert({
      where: { sessionId_enrollmentId: { sessionId: record.sessionId, enrollmentId: record.enrollmentId } },
      update: {
        status: record.status,
        checkInAt: record.checkInAt,
        checkOutAt: record.checkOutAt,
        note: record.note,
      },
      create: record,
    });
    return toDomain(saved);
  }
}