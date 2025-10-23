import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './main/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationGuard } from './guards/auth.guard';
import { JobModule } from './main/job/job.module';
import { ServiceProviderModule } from './main/service-provider/service-provider.module';
import { AdminModule } from './main/admin/admin.module';
import { ConsumerModule } from './main/consumer/consumer.module';
import { MessagesModule } from './main/messages/messages.module';
import { StripeModule } from './main/stripe/stripe.module';
import { PaymentModule } from './main/payment/payment.module';
import { ReviewModule } from './main/review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    JwtModule.register({}),
    JobModule,
    ServiceProviderModule,
    AdminModule,
    ConsumerModule,
    MessagesModule,
    StripeModule,
    PaymentModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: AuthenticationGuard }],
})
export class AppModule {}
