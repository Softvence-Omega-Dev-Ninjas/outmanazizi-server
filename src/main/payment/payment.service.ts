// payments.service.ts (snippet)
import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateTransferDto, RefundDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {}

  // make a customer payment intent
  async makeCustomer(userId: string) {
    const existingCustomers = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingCustomers?.email) {
      throw new BadRequestException('User not found or email is missing');
    }

    const customer = await this.stripe.customers.create({
      metadata: { userId },
      email: existingCustomers.email,
      name: existingCustomers.name,
    });
    return customer;
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    try {
      await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
        customer: dto.customerId,
      });
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: 2000,
        currency: 'usd',
        metadata: { userId },
        payment_method_types: ['card'],
        customer: dto.customerId,
        payment_method: dto.paymentMethodId,
        confirm: true,
        transfer_data: {
          destination: 'acct_1SKSsiFiMsinqOFu',
        },
      });
      return paymentIntent;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create payment intent: ${message}`);
    }
  }

  async createTransfer(dto: CreateTransferDto) {
    const transfer = await this.stripe.transfers.create({
      amount: dto.amountCents,
      currency: dto.currency || 'usd',
      destination: dto.destinationAcctId,
    });
    return transfer;
  }

  async refundCharge(dto: RefundDto) {
    const refund = await this.stripe.refunds.create({
      charge: dto.chargeId,
      amount: dto.amountCents,
    });
    this.logger.log(`Refund ${refund.id} for charge ${dto.chargeId}`);
    return refund;
  }
}
