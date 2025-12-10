import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  providers: [HelperService],
  exports: [HelperService],
})
export class HelperModule { }
