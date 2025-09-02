import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './Main/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from './guards/auth.guard';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, JwtModule.register({})],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: AuthenticationGuard }],
})
export class AppModule { }
