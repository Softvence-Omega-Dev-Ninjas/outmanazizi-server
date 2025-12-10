import { Module } from '@nestjs/common';
import { PaymentsController } from './payment.controller';
import { PaymentsService } from './payment.service';
import { StripeModule } from '../stripe/stripe.module';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [StripeModule, JwtModule, FirebaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentModule { }
