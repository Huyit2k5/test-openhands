/**
 * ATTENDANCE MODULE — NestJS composition root
 * ------------------------------------------------------------------
 * This is where Clean Architecture meets the NestJS DI container. The provider
 * list is the whole "dependency graph" of the module in one place:
 *
 *   Domain        (no providers — plain entities + interfaces)
 *   Application   MarkAttendance (use case) + ATTENDANCE_CLOCK factory
 *   Infrastructure PrismaService + PrismaAttendanceRepository bound to the
 *                  AttendanceRepository interface token (useClass)
 *   Presentation  AttendanceController
 *
 * The single most important line for the dependency rule is:
 *   { provide: AttendanceRepository, useClass: PrismaAttendanceRepository }
 * The Application depends on the *interface*; only the module knows the
 * interface is fulfilled by the Prisma implementation. Swap the implementation
 * (e.g. to an in-memory fake) by changing one line here — nothing upstream
 * changes.
 */
import { Module } from '@nestjs/common';

// Application
import { MarkAttendance } from './application/mark-attendance.use-case';
import { clockProvider } from './application/providers/clock.provider';
import { ATTENDANCE_REPOSITORY } from './application/constants/attendance.tokens';

// Infrastructure
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaAttendanceRepository } from './infrastructure/repositories/prisma-attendance.repository';

// Presentation
import { AttendanceController } from './presentation/controllers/attendance.controller';

@Module({
  controllers: [AttendanceController],
  providers: [
    // Application layer
    MarkAttendance,
    clockProvider,

    // Infrastructure layer
    PrismaService,
    // Bind the Domain port token to its concrete Prisma implementation. The
    // Application never sees `PrismaAttendanceRepository` — it depends on the
    // `AttendanceRepository` abstraction through `ATTENDANCE_REPOSITORY`.
    { provide: ATTENDANCE_REPOSITORY, useClass: PrismaAttendanceRepository },
  ],
})
export class AttendanceModule {}