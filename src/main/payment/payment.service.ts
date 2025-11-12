// payments.service.ts (snippet)
import {
  Injectable,
  Inject,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateTransferDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { MakeCustomerDto } from './dto/makeCustomer.dto';
import { RefundDto } from './dto/refund.dto';
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

  async makeCustomer(userId: string, makeCustomerDto: MakeCustomerDto) {
    this.logger.log(`Making customer for userId: ${userId}`);
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
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
      this.logger.log(`Customer information updated successfully for userId: ${userId}`);
      return ApiResponse.success(res, 'Customer information updated successfully');
    } catch (error) {
      this.logger.error(`Failed to create customer for userId: ${userId}`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create customer: ${message}`);
    }
  }
  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    this.logger.log(`Creating payment intent for userId: ${userId}`);
    try {
      const userExistsByUserid = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExistsByUserid || !userExistsByUserid.customerIdFromStripe || !userExistsByUserid.paymentMethodIdFromStripe) {
        this.logger.warn(`User not found: ${userId}`);
        throw new NotFoundException('User not found');
      }
      const adminAccount = process.env.ADMIN_ACCOUNT;
      if (!adminAccount) {
        this.logger.error('ADMIN_ACCOUNT not configured in environment');
        throw new NotFoundException('Admin account not configured');
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: dto.amount,
        currency: 'usd',
        metadata: { userId },
        payment_method_types: ['card'],
        customer: userExistsByUserid.customerIdFromStripe,
        payment_method: userExistsByUserid.paymentMethodIdFromStripe,
        confirm: true,
      });

      this.logger.log(`Payment intent created successfully for userId: ${userId}`);
      return ApiResponse.success(paymentIntent, 'Payment intent created successfully');
    } catch (error) {
      this.logger.error(`Failed to create payment intent for userId: ${userId}`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create payment intent: ${message}`);
    }
  }

  async createTransfer(dto: CreateTransferDto) {
    this.logger.log(`Creating transfer for amount: ${dto.amountCents}`);
    try {
      const sellerAccount = await this.stripe.accounts.retrieve(dto.destinationAcctId);
      if (!sellerAccount) {
        this.logger.warn(`Seller account not found: ${dto.destinationAcctId}`);
        throw new NotFoundException('Seller account not found');
      }
      if (sellerAccount?.capabilities?.transfers !== 'active') {
        throw new Error('Seller account is not ready for transfers');
      }
      const transfer = await this.stripe.transfers.create({
        amount: dto.amountCents,
        currency: dto.currency || 'usd',
        destination: dto.destinationAcctId,
      });
      this.logger.log(`Transfer created successfully for amount: ${dto.amountCents}`);
      return ApiResponse.success(transfer, 'Transfer created successfully');
    } catch (error) {
      this.logger.error(`Failed to create transfer for amount: ${dto.amountCents}`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to create transfer: ${message}`);
    }
  }

  async refundCharge(dto: RefundDto) {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: dto.paymentIntentId,
        amount: dto.amount,
      });
      // this.logger.log(`Refund processed successfully for chargeId: ${dto.chargeId}`);
      return refund;
    } catch (error) {
      // this.logger.error(`Failed to process refund for chargeId: ${dto.chargeId}`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to process refund: ${message}`);
    }
  }
}
