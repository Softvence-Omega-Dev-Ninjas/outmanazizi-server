import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import Stripe from 'stripe';


export const stripeProvider = {
  provide: 'STRIPE_CLIENT',
  useValue: new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-09-30.clover',
  }),
};

@Module({
  controllers: [StripeController],
  providers: [StripeService, stripeProvider],
  exports: [StripeService],
})
export class StripeModule { }
