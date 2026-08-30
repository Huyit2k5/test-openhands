/**
 * PRISMA SERVICE (Infrastructure)
 * ------------------------------------------------------------------
 * A single, module-scoped provider that owns the `PrismaClient` instance and
 * its lifecycle (connect on module init, disconnect on shutdown). Repositories
 * depend on this provider instead of constructing their own clients, which
 * keeps exactly one live connection pool per application and makes teardown
 * explicit.
 *
 * The `PRISMA_CLIENT` token lets us expose the concrete client under a stable
 * injection token without leaking the Prisma class into provider metadata.
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('PrismaClient connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('PrismaClient disconnected');
  }
}