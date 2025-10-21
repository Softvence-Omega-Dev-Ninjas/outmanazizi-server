import { Module } from '@nestjs/common';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { StripeModule, stripeProvider } from '../stripe/stripe.module';


@Module({
  imports: [StripeModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, stripeProvider],
})
export class PaymentModule { }
