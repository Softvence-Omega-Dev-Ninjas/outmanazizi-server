import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateAccountLinkDto } from './dto/create-stripe.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class StripeService {
  constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) {}

  async createExpressAccount(userId: string) {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { userId },
      });
      return account;
    } catch (error) {
      console.log(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      ApiResponse.error('Stripe Account Creation Failed', error.message);
    }
  }
  async createAccountLink(dto: CreateAccountLinkDto) {
    try {
      const link = await this.stripe.accountLinks.create({
        account: dto.stripeAccountId,
        refresh_url: dto.refreshUrl,
        return_url: dto.returnUrl,
        type: 'account_onboarding',
      });
      return link;
    } catch (error) {
      console.error('Stripe account link creation failed:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const msg = error?.message ?? JSON.stringify(error);
      throw new Error(`Stripe Account Link Creation Failed: ${msg}`);
    }
  }

  async createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
    const loginLink = await this.stripe.accounts.createLoginLink(accountId);
    return loginLink;
  }
}
