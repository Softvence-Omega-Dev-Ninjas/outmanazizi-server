import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/utils/helper/helper.module';
import { MailModule } from 'src/utils/mail/mail.module';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    PrismaModule,
    HelperModule,
    MailModule,
    JwtModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
