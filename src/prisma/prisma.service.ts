import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {

    console.log('⚡Database connected successfully...');
    await this.$connect();
  }
  async onModuleDestroy() {
    console.log('⚡Database disconnected successfully...');
    await this.$disconnect();
  }
}
