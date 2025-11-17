import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId: account.id },
      });


      const link = await this.stripe.accountLinks.create({
        account: account.id,
        refresh_url: 'https://example.com/refresh',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });
      this.logger.log(`Stripe Express account created successfully for user: ${userId}`);
      return { url: link.url };
    } catch (error) {
      this.logger.error('Stripe account creation failed', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponse.error('Stripe Account Creation Failed', errorMessage);
    }
  }
  async generateAccountLink(accountId: string) {
    this.logger.log(`Generating account link for Stripe account ID: ${accountId}`);
    try {
      try {
        await this.stripe.accounts.retrieve(accountId);
      } catch (error) {
        this.logger.error(`Stripe account not found for account ID: ${accountId}`, error);
        throw new NotFoundException(`Stripe account not found for account ID: ${accountId}`);
      }
      const accountLink = await this.stripe.accounts.createLoginLink(accountId);
      return accountLink;
    } catch (error) {
      this.logger.error('Failed to generate account link', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
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
      this.logger.error('Failed to retrieve Stripe account', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(errorMessage);
    }
  }

  async getStripeInfo(userId: string) {
    this.logger.log(`Getting Stripe info for user: ${userId}`);
    try {
      const [account, balance, payments, transfers, accountsList] = await Promise.all([
        this.stripe.accounts.retrieve(),
        this.stripe.balance.retrieve(),
        this.stripe.paymentIntents.list({ limit: 10 }),
        this.stripe.transfers.list({ limit: 10 }),
        this.stripe.accounts.list({ limit: 3 }),
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
      };

    } catch (error) {
      this.logger.error('Failed to get Stripe info', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return ApiResponse.error('Failed to get Stripe info', errorMessage);
    }
  }
  async deleteAccount(accountId: string): Promise<Stripe.DeletedAccount> {
    this.logger.log(`Deleting Stripe account for account ID: ${accountId}`);
    try {
      const deletedAccount = await this.stripe.accounts.del(accountId);
      this.logger.log(`Stripe account deleted successfully for account ID: ${accountId}`);
      return deletedAccount;
    } catch (error) {
      this.logger.error('Failed to delete Stripe account', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Stripe Account Deletion Failed: ${errorMessage}`);
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
      this.logger.error('Failed to retrieve payout history', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve payout history: ${errorMessage}`);
    }
  }





}
