import { HttpException, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException,BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { PrismaService } from 'src/prisma/prisma.service';



@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prisma: PrismaService
    // private readonly logger: Logger,
  ) { }

  async createExpressAccount(userId: string) {
    this.logger.log(`🚀 Starting Stripe Express onboarding for user: ${userId}`);

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      // 1️⃣ Check if user exists
      if (!user) {
        this.logger.warn(`❌ User not found: ${userId}`);
        throw new NotFoundException('User not found');
      }

      const refreshUrl = 'https://outmanazizi.com/stripe/refresh'; //process.env.STRIPE_REFRESH_URL;
      const returnUrl = 'https://outmanazizi.com/stripe/return'; //process.env.STRIPE_RETURN_URL;

      if (!refreshUrl || !returnUrl) {
        throw new Error('Missing STRIPE_REFRESH_URL or STRIPE_RETURN_URL in environment variables');
      }

      // 2️⃣ If Stripe account already exists → Generate onboarding link again
      if (user.stripeAccountId) {
        this.logger.log(`ℹ️ Existing Stripe account detected. Generating new onboarding link…`);

        const link = await this.stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: 'account_onboarding',
        });

        return ApiResponse.success(
          { url: link.url },
          'Stripe account already exists. New onboarding link generated.'
        );
      }

      // 3️⃣ Create new Stripe Express account
      this.logger.log(`🆕 Creating new Stripe Express account for user: ${userId}`);

      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        business_type: 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { userId },
      });

      // Save Stripe account ID to DB
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId: account.id },
      });

      this.logger.log(`✅ Stripe account created and saved for user: ${userId}`);

      // 4️⃣ Generate onboarding link for new account
      const onboardingLink = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      this.logger.log(`🔗 Onboarding link generated: ${onboardingLink.url}`);

      return ApiResponse.success(
        { url: onboardingLink.url },
        'Stripe Express account created successfully'
      );

    } catch (error) {
      this.logger.error('Stripe account creation failed', error instanceof Error ? error.stack : error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  async generateAccountLink(accountId: string) {
    this.logger.log(`Generating account link for Stripe account ID: ${accountId}`);
    try {
      try {
      const data =   await this.stripe.accounts.retrieve(accountId);

  if (data.type === 'standard') {
  throw new BadRequestException(
    'Dashboard access is managed directly by Stripe for standard accounts.',
  );
}

// ❌ Onboarding incomplete
if (!data.details_submitted) {
  throw new BadRequestException(
    'Please complete Stripe onboarding before accessing the dashboard.',
  );
}
      } catch (error) {
        this.logger.error(`Stripe account not found for account ID: ${accountId}`, error);
        throw new NotFoundException(`Stripe account not found for account ID: ${accountId}`);
      }

      const accountLink = await this.stripe.accounts.createLoginLink(accountId);
      
      console.log({accountLink});
      return accountLink;
    } catch (error) {
      this.logger.error('Failed to generate account link', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException|| error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
    }
  }
  async retrieveAccount(accountId: string): Promise<Stripe.Account> {
    this.logger.log(`Retrieving Stripe account for account ID: ${accountId}`);
    try {

      try {
        const account = await this.stripe.accounts.retrieve(accountId);
        if (!account) {
          this.logger.warn(`Stripe account not found: ${accountId}`);
          throw new NotFoundException('Stripe account not found');
        }
        return account;
      } catch (error) {
        this.logger.error(`Stripe account not found for account ID: ${accountId}`, error);
        throw new NotFoundException(`Stripe account not found for account ID: ${accountId}`);
      }


    } catch (error) {
      this.logger.error('Failed to retrieve Stripe account', error instanceof Error ? error.stack : error);
      if (error instanceof  HttpException|| error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve Stripe account');
    }
  }

  async getStripeInfo(userId: string) {
    this.logger.log(`Getting Stripe info for user: ${userId}`);
    try {
      const [account, balance, payments, transfers, accountsList, refundList] = await Promise.all([
        this.stripe.accounts.retrieve(),
        this.stripe.balance.retrieve(),
        this.stripe.paymentIntents.list({ limit: 100 }),
        this.stripe.transfers.list({ limit: 100 }),
        this.stripe.accounts.list({ limit: 100 }),
        this.stripe.refunds.list({ limit: 100 }),
      ]);
      return {
        account: { id: account.id, email: account.email },
        balance: { available: balance.available[0].amount, pending: balance.pending[0].amount },
        recentPaymentsIntents: payments.data.map(pi => ({
          id: pi.id,
          amount: pi.amount,
        })),
        recentTransfers: transfers.data.map(tr => ({
          id: tr.id,
          amount: tr.amount,
          destination: tr.destination,
        })),
        accountsList: accountsList.data.map(acc => ({
          id: acc.id,
          email: acc.individual?.email,
          userId: acc?.metadata?.userId
        })),
        refundList: refundList.data.map(ref => ({
          id: ref.id,
          amount: ref.amount,
          payment_intent: ref.payment_intent,
        })),
      };

    } catch (error) {
      this.logger.error('Failed to get Stripe info', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException|| error instanceof NotFoundException) {
        throw error;
      } 
    }
  }
  async deleteAccount(accountId: string): Promise<Stripe.DeletedAccount> {
    this.logger.log(`Deleting Stripe account for account ID: ${accountId}`);
    try {
      const deletedAccount = await this.stripe.accounts.del(accountId);
      this.logger.log(`Stripe account deleted successfully for account ID: ${accountId}`);
      return deletedAccount;
    } catch (error) {
      this.logger.error('Failed to delete Stripe account', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Stripe Account Deletion Failed');
    }
  }
  // payout history
  async getPayoutHistory(userId: string): Promise<{ payoutsdata: { id: string; amount: number; arrival_date: number | null }[]; availableBalance: number }> {
    this.logger.log(`Retrieving payout history for Stripe account ID: ${userId}`);

    try {
      const serviceProvider = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!serviceProvider || !serviceProvider.stripeAccountId) {
        this.logger.warn(`Service provider or Stripe account not found for user ID: ${userId}`);
        throw new NotFoundException('Service provider or Stripe account not found');
      }
      const payouts = await this.stripe.payouts.list(

        { stripeAccount: serviceProvider.stripeAccountId }
      );
      const payoutsdata = payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        arrival_date: payout.arrival_date,
      }));
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: serviceProvider.stripeAccountId
      });

      this.logger.log(`Payout history retrieved successfully for account ID: ${userId}`);
      return { payoutsdata, availableBalance: balance.available[0].amount };
    } catch (error) {
      this.logger.error('Failed to retrieve payout history', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve payout history');
    }
  }
}
