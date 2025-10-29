import { Module } from '@nestjs/common';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { StripeModule } from '../stripe/stripe.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [StripeModule, JwtModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentModule {}
