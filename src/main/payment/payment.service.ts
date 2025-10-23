// payments.service.ts (snippet)
import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateTransferDto, RefundDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
export interface CustomerResponse {
  id: string;
  email: string | null;
  name: string | null;
}
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {}

  // make a customer payment intent
  async makeCustomer(userId: string) {
    // 1️⃣ Fetch user from DB
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    try {
      let customer: Stripe.Customer;

      if (!user.customerId) {
        // 2️⃣ Create Stripe Customer if not exists
        customer = await this.stripe.customers.create({
          metadata: { userId },
          email: user.email ?? undefined,
          name: user.name ?? undefined,
        });

        // 3️⃣ Save customerId in DB
        await this.prisma.user.update({
          where: { id: userId },
          data: { customerId: customer.id },
        });
      } else {
        // 4️⃣ Retrieve existing Stripe Customer
        customer = (await this.stripe.customers.retrieve(user.customerId)) as Stripe.Customer;
      }
      return ApiResponse.success(
        {
          id: customer.id,
          email: customer.email ?? null,
          name: customer.name ?? null,
        },
        'Customer retrieved successfully',
      );
    } catch (error: unknown) {
      // Proper error handling
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create or retrieve customer: ${message}`);
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    try {
      await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
        customer: dto.customerId,
      });
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amountCents,
        currency: dto.currency || 'usd',
        metadata: { userId },
        payment_method_types: ['card'],
        customer: dto.customerId,
        payment_method: dto.paymentMethodId,
        confirm: true,
        transfer_data: {
          destination: process.env.ADMIN_ACCOUNT!,
        },
      });
      return ApiResponse.success(paymentIntent, 'Payment intent created successfully');
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
    return refund;
  }
}
