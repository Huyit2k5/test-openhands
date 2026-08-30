/**
 * DOMAIN ERROR EXCEPTION FILTER (Presentation)
 * ------------------------------------------------------------------
 * A global filter that translates Domain-layer exceptions into HTTP responses.
 *
 * This is where the "Domain has no knowledge of HTTP" principle pays off:
 * the entity throws `AttendanceDomainError` (a pure business concept) and the
 * *presentation* decides how to express it over the wire. Keeping the mapping
 * here means the Domain and Application layers never import NestJS.
 *
 * Mapping:
 *   - AttendanceDomainError  -> 409 Conflict (business rule violated)
 *
 * Errors that are not Domain errors (programming bugs, missing deps, …) are
 * intentionally left to Nest's default handling, which returns 500.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AttendanceDomainError } from '../../domain/exceptions/attendance.errors';

@Catch(AttendanceDomainError)
export class DomainErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainErrorFilter.name);

  catch(exception: AttendanceDomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    this.logger.warn(`Domain error ${exception.code}: ${exception.message}`);

    response
      .status(HttpStatus.CONFLICT)
      .json({
        statusCode: HttpStatus.CONFLICT,
        code: exception.code,
        message: exception.message,
      });
  }
}