import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/utils/helper/helper.module';

@Module({
  imports: [JwtModule, PrismaModule, HelperModule],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule { }
