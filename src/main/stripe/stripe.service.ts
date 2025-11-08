import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateAccountLinkDto } from './dto/create-stripe.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    // private readonly logger: Logger,
  ) { }

  async createExpressAccount(userId: string) {
    this.logger.log(`Creating Stripe Express account for user: ${userId}`);
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
      this.logger.log(`Stripe Express account created successfully for user: ${userId}`);
      return account;
    } catch (error) {
      this.logger.error('Stripe account creation failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponse.error('Stripe Account Creation Failed', errorMessage);
    }
  }
  async createAccountLink(dto: CreateAccountLinkDto) {
    this.logger.log(`Creating Stripe account link for account: ${dto.stripeAccountId}`);
    try {
      const link = await this.stripe.accountLinks.create({
        account: dto.stripeAccountId,
        refresh_url: dto.refreshUrl,
        return_url: dto.returnUrl,
        type: 'account_onboarding',
      });
      this.logger.log(`Stripe account link created successfully for account: ${dto.stripeAccountId}`);
      return { url: link.url, expires_at: link.expires_at };
    } catch (error) {
      this.logger.error('Stripe account link creation failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponse.error('Stripe Account Link Creation Failed', errorMessage);
    }
  }

  async createLoginLink(accountId: string): Promise<Stripe.LoginLink> {
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(accountId);
      return loginLink;
    } catch (error) {
      this.logger.error('Failed to create Stripe login link', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Stripe Login Link Creation Failed: ${errorMessage}`);
    }
  }
}
