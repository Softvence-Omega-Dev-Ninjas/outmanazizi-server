// payments.service.ts (snippet)
import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateTransferDto, RefundDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { MakeCustomerDto } from './dto/makeCustomer.dto';
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
  ) { }




  // make a customer payment intent
  // async makeCustomer(userId: string) {
  //   // 1️⃣ Fetch user from DB
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   try {
  //     let customer: Stripe.Customer;

  //     if (!user.customerId) {
  //       // 2️⃣ Create Stripe Customer if not exists
  //       customer = await this.stripe.customers.create({
  //         metadata: { userId },
  //         email: user.email ?? undefined,
  //         name: user.name ?? undefined,
  //       });

  //       // 3️⃣ Save customerId in DB
  //       await this.prisma.user.update({
  //         where: { id: userId },
  //         data: { customerId: customer.id },
  //       });
  //     } else {
  //       const retrieved = await this.stripe.customers.retrieve(user.customerId);
  //       if (retrieved.deleted) {
  //         throw new InternalServerErrorException('Customer has been deleted in Stripe');
  //       }
  //       customer = retrieved;
  //     }
  //     return ApiResponse.success(
  //       {
  //         id: customer.id,
  //         email: customer.email ?? null,
  //         name: customer.name ?? null,
  //       },
  //       'Customer retrieved successfully',
  //     );
  //   } catch (error: unknown) {
  //     // Proper error handling
  //     const message = error instanceof Error ? error.message : 'Unknown error';
  //     throw new InternalServerErrorException(`Failed to create or retrieve customer: ${message}`);
  //   }
  // }
  async makeCustomer(userId: string, makeCustomerDto: MakeCustomerDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      // Update user with provided customerId and paymentMethodId
      const res = await this.prisma.user.update({
        where: { id: userId },
        data: {
          customerIdFromStripe: makeCustomerDto.customerIdFromStripe,
          paymentMethodIdFromStripe: makeCustomerDto.paymentMethodIdFromStripe,
        },
      });
      return ApiResponse.success(res, 'Customer information updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create customer: ${message}`);
    }
  }
  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    try {
      if (!dto.paymentMethodId) {
        throw new BadRequestException('Payment method ID is required');
      }
      if (!dto.customerId) {
        throw new BadRequestException('Customer ID is required');
      }
      // Check if payment method is already attached to this customer
      const paymentMethod = await this.stripe.paymentMethods.retrieve(dto.paymentMethodId);
      if (paymentMethod.customer !== dto.customerId) {
        // Check if payment method is already attached to this customer
        const paymentMethod = await this.stripe.paymentMethods.retrieve(dto.paymentMethodId);
        if (paymentMethod.customer !== dto.customerId) {
          await this.stripe.paymentMethods.attach(dto.paymentMethodId, {
            customer: dto.customerId,
          });
        }
      }
      if (!process.env.ADMIN_ACCOUNT) {
        throw new InternalServerErrorException('ADMIN_ACCOUNT environment variable not configured');
      }
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amountCents,
        currency: dto.currency || 'usd',
        metadata: { userId },
        payment_method_types: ['card'],
        customer: dto.customerId,
        payment_method: dto.paymentMethodId,
        confirm: true,
        transfer_data: {
          destination: process.env.ADMIN_ACCOUNT,
        },
      });
      return ApiResponse.success(paymentIntent, 'Payment intent created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create payment intent: ${message}`);
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
