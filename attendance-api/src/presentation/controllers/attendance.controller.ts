/**
 * ATTENDANCE CONTROLLER (Presentation)
 * ------------------------------------------------------------------
 * The outermost layer of the module. It is the only place that knows about
 * HTTP. Its responsibilities are deliberately narrow:
 *
 *   1. Bind the route and parse/validate the HTTP request.
 *   2. Translate the HTTP payload into an application-layer command
 *      (`MarkAttendanceInput`) — the "inward" direction of Clean Architecture.
 *   3. Delegate the actual work to the `MarkAttendance` use case (injected via
 *      NestJS constructor DI — the controller does NOT touch Prisma or the
 *      domain repository directly).
 *   4. Translate the application result back into the HTTP response DTO.
 *   5. Map Domain errors to appropriate HTTP status codes.
 *
 * Dependency rule in action: this file imports from `application` and `domain`
 * (inward), never the other way round.
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
} from '@nestjs/common';
import { MarkAttendance } from '../../application/mark-attendance.use-case';
import { MarkAttendanceInput } from '../../application/dtos/mark-attendance.use-case.dto';
import {
  AttendanceClosedError,
  AttendanceDomainError,
} from '../../domain/exceptions/attendance.errors';
import { MarkAttendanceDto, AttendanceResponseDto } from '../dtos/attendance.dto';
import { toAttendanceResponse } from '../mappers/attendance.response.mapper';

@Injectable()
@Controller('attendance')
export class AttendanceController {
  /**
   * NestJS dependency injection: the `MarkAttendance` use case is injected by
   * class token. The controller is fully decoupled from persistence — it only
   * orchestrates the HTTP boundary.
   */
  constructor(private readonly markAttendance: MarkAttendance) {}

  /**
   * POST /attendance
   * Marks (or re-marks) the attendance of one enrollment within a session.
   * Idempotent per (sessionId, enrollmentId) thanks to the repository upsert.
   *
   * @returns 200 with the persisted attendance snapshot.
   * @throws 409 when a business rule is violated (e.g. re-marking a closed record).
   * @throws 400 for malformed input (handled by a validation pipe upstream).
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async mark(@Body() body: MarkAttendanceDto): Promise<AttendanceResponseDto> {
    // 1) HTTP -> application command.
    const input = new MarkAttendanceInput(
      body.sessionId,
      body.enrollmentId,
      body.status,
      body.note ?? null,
    );

    // 2) Delegate to the use case; domain errors bubble up to the handler.
    const result = await this.markAttendance.execute(input);

    // 3) Application result -> HTTP DTO.
    return toAttendanceResponse(result);
  }
}