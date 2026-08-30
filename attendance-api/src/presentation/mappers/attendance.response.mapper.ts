/**
 * ATTENDANCE RESPONSE MAPPER (Presentation)
 * ------------------------------------------------------------------
 * Converts the application-layer result object into the HTTP response DTO.
 * This is where `Date` becomes an ISO-8601 string and the internal shape is
 * turned into the public JSON contract. Keeping this mapping here means the
 * use case returns a "clean" result and the controller never assembles the
 * response body itself.
 */
import { MarkAttendanceResult } from '../../application/dtos/mark-attendance.use-case.dto';
import { AttendanceResponseDto } from '../dtos/attendance.dto';

export function toAttendanceResponse(result: MarkAttendanceResult): AttendanceResponseDto {
  const dto = new AttendanceResponseDto();
  dto.id = result.id;
  dto.sessionId = result.sessionId;
  dto.enrollmentId = result.enrollmentId;
  dto.status = result.status;
  dto.checkInAt = result.checkInAt ? result.checkInAt.toISOString() : null;
  dto.checkOutAt = result.checkOutAt ? result.checkOutAt.toISOString() : null;
  dto.note = result.note;
  return dto;
}