import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/utils/helper/helper.module';
import { MailModule } from 'src/utils/mail/mail.module';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, HelperModule, MailModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard],
  // Export AuthenticationGuard only if it is intended for use in other modules
  exports: [AuthService],
})
export class AuthModule {}
