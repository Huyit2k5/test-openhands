/**
 * ATTENDANCE API — BOOTSTRAP
 * ------------------------------------------------------------------
 * Composition-root entry point. Builds the Nest application, registers the
 * Domain-error filter globally (so business-rule violations become HTTP 409
 * regardless of which controller raised them), and starts the HTTP server.
 *
 * Run:  npx tsx attendance-api/src/main.ts
 * (The module's tsconfig uses CommonJS, so plain `tsx` runs it directly.)
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AttendanceModule } from './attendance.module';
import { DomainErrorFilter } from './presentation/filters/domain-error.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AttendanceModule, {
    // Quiet the default Nest "Nest application successfully started" banner noise
    // in favour of a single, explicit line.
    logger: ['error', 'warn', 'log'],
  });

  // Map Domain-layer exceptions to HTTP responses for the whole app.
  app.useGlobalFilters(new DomainErrorFilter());

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  Logger.log(`Attendance API listening on http://localhost:${port}/attendance`, 'Bootstrap');

  // Graceful shutdown: close the Prisma pool and the HTTP server on exit.
  const shutdown = async (signal: string): Promise<void> => {
    Logger.log(`${signal} received, shutting down…`, 'Bootstrap');
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void bootstrap();