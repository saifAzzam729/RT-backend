import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private configService: ConfigService) {
    // Load DB URL BEFORE calling super()
    const url = configService.get<string>('database.url');

    if (!url) {
      throw new Error('DATABASE_URL is not configured');
    }

    // Prisma 6: Set environment variable before calling super()
    process.env.DATABASE_URL = url;

    // Prisma 6 will read DATABASE_URL from process.env
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
