import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HelperModule } from 'src/utils/helper/helper.module';
import { GoogleStrategy } from './strategy/goggle.strategy';
import { FacebookStrategy } from './strategy/facebook.strategy';
import { MailModule } from 'src/utils/mail/mail.module';
import { AuthenticationGuard } from 'src/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ ensure env works globally
    MailModule,
    HelperModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'supersecretkey123',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    FacebookStrategy,
    AuthenticationGuard
  ],
  exports: [
    AuthService,
    JwtModule,
    AuthenticationGuard,
  ],
})
export class AuthModule { }
