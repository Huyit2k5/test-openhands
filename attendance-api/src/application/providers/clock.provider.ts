/**
 * CLOCK PROVIDER (Application / Infrastructure wiring)
 * ------------------------------------------------------------------
 * Supplies the `ATTENDANCE_CLOCK` dependency: a `() => Date` factory returning
 * the current wall-clock time. Isolating "now" behind a factory (instead of
 * calling `new Date()` inside the use case) is what makes the use case
 * deterministically testable — a test module can rebind the same token to a
 * fixed date.
 */
import { Provider } from '@nestjs/common';
import { ATTENDANCE_CLOCK } from '../constants/attendance.tokens';

export const clockProvider: Provider = {
  provide: ATTENDANCE_CLOCK,
  useFactory: (): (() => Date) => () => new Date(),
};