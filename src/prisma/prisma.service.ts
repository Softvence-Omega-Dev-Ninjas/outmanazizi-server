import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    console.log('⚡Database connected successfully...');
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
