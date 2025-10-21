// payments.service.ts (snippet)
import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(@Inject('STRIPE_CLIENT') private readonly stripe: Stripe) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
    try {
      const pi = await this.stripe.paymentIntents.create({
        amount: dto.amountCents,
        currency: dto.currency || 'usd',
        customer: dto.customerId,
        payment_method: dto.paymentMethodId,
        confirm: true,
        metadata: { orderId: dto.orderId, transfer_group: `ORDER_${dto.orderId}` },
      });

      return pi;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create payment intent: ${message}`);
    }
  }

  async createTransfer({
    amountCents,
    currency,
    destinationAcctId,
    orderId,
    idempotencyKey,
  }: {
    amountCents: number;
    currency: string;
    destinationAcctId: string;
    orderId: string;
    idempotencyKey?: string;
  }) {
    const transfer = await this.stripe.transfers.create(
      {
        amount: amountCents,
        currency,
        destination: destinationAcctId,
        transfer_group: `ORDER_${orderId}`,
      },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    this.logger.log(`Transfer ${transfer.id} to ${destinationAcctId} for order ${orderId}`);
    return transfer;
  }

  async refundCharge({
    chargeId,
    amountCents,
    idempotencyKey,
  }: {
    chargeId: string;
    amountCents?: number;
    idempotencyKey?: string;
  }) {
    const refund = await this.stripe.refunds.create(
      { charge: chargeId, amount: amountCents },
      idempotencyKey ? { idempotencyKey } : undefined,
    );
    this.logger.log(`Refund ${refund.id} for charge ${chargeId}`);
    return refund;
  }

  async retrieveAccount(acctId: string) {
    return this.stripe.accounts.retrieve(acctId);
  }

  async getPlatformBalance() {
    return this.stripe.balance.retrieve();
  }
}
