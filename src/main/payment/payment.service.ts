// payments.service.ts (snippet)
import {
  Injectable,
  Inject,
  Logger,
  HttpException,
  InternalServerErrorException,
  NotFoundException,BadRequestException
} from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto, CreateTransferDto } from './dto/create-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { MakeCustomerDto } from './dto/makeCustomer.dto';
import { RefundDto } from './dto/refund.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FirebaseService } from '../firebase/firebase.service';
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
    private readonly eventEmitter: EventEmitter2,
    private readonly firebase: FirebaseService,
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
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create customer');
    }
  }
  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    this.logger.log(`Creating payment intent for userId: ${userId}`);
    try {
      const userExistsByUserid = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const bidExists = await this.prisma.bid.findUnique({
        where: { id: dto.bidId },
      })
      const persentExists = await this.prisma.platformFee.findFirst({
        where: { amount: dto.applicationFeePersent },
      })
      if (!persentExists) {
        throw new NotFoundException('Application fee percent not found');
      }

      if (!bidExists) {
        throw new NotFoundException('Bid not found');
      }
      if (!userExistsByUserid || !userExistsByUserid.customerIdFromStripe || !userExistsByUserid.paymentMethodIdFromStripe) {
        this.logger.warn(`User not found or missing Stripe customer/payment method for userId: ${userId}`);
        throw new NotFoundException(' User not found or missing Stripe customer/payment method');
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



      const oder = await this.prisma.order.create({
        data: {
          serviceProviderId: bidExists.serviceProviderId,
          consumerId: userId,
          bidId: dto.bidId,
          paymentIntentId: paymentIntent.id,
          status: 'IN_PROGRESS',
          applicationFeePersen: dto.applicationFeePersent,
        }
      })
      await this.prisma.notification.create({
        data: {
          fromNotification: userId,
          toNotification: bidExists.serviceProviderId,
          message: `A new order has been created for your bid ${dto.bidId}.`,
          createdAt: new Date(),
        }
      })
      this.logger.log(`Payment intent created successfully for userId: ${userId}`);
      return ApiResponse.success(oder, 'Payment intent created successfully');
    } catch (error) {
      this.logger.error(`Failed to create payment intent for userId: ${userId}`, error);
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async createTransfer(userId: string, dto: CreateTransferDto) {
    this.logger.log(`Creating transfer for userId: ${userId}`);
    try {
      const userExist = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExist) {
        this.logger.warn(` User not found or not authorized: ${userId}`);
        throw new NotFoundException('User not found');
      }
      const orderExists = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
      if (!orderExists) {
        this.logger.warn(`Order not found: ${dto.orderId}`);
        throw new NotFoundException('Order not found');
      }
      const bidExists = await this.prisma.bid.findUnique({
        where: { id: orderExists.bidId },
        include: {
          serviceProvider: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!bidExists) {
        this.logger.warn(`Bid not found for order: ${dto.orderId}`);
        throw new NotFoundException('Bid not found for the given order');
      }
      const stripeAccountId = bidExists.serviceProvider.user.stripeAccountId;
      if (!stripeAccountId) {
        this.logger.warn(`Service provider does not have a Stripe account ID: ${bidExists.serviceProviderId}`);
        throw new NotFoundException('Service provider Stripe account ID not found');
      }
      const sellerAccount = await this.stripe.accounts.retrieve(stripeAccountId);
      if (!sellerAccount) {
        this.logger.warn(`Seller account not found: ${stripeAccountId}`);
        throw new NotFoundException('Seller account not found');
      }
      if (sellerAccount?.capabilities?.transfers !== 'active') {
        throw new NotFoundException('Seller account is not ready for transfers');
      }

      await this.stripe.transfers.create({
        amount: dto.amountCents,
        currency: 'usd',
        destination: stripeAccountId,
      });

      const orderUpdate = await this.prisma.order.update({
        where: {
          id: dto.orderId
        },
        data: {
          status: 'COMPLETED'
        }
      });
      // console.log({ bidExists });
      await this.prisma.notification.create({
        data: {
          fromNotification: userId,
          toNotification: bidExists.serviceProvider.userId,
          message: `Payment of $${(dto.amountCents / 100).toFixed(2)} has been released to your account for order ${dto.orderId}.`,
          createdAt: new Date(),
        }
      });
      this.eventEmitter.emit(
        'Notification',
        {
          toNotification: bidExists.serviceProviderId,
          fromNotification: userId,
          type: 'PAYMENT_RELEASED',
          jobId: orderExists.id,
        },
      );
      const consumerTokensResult = await this.prisma.user.findUnique({
        where: { id: orderExists.consumerId },
        select: { fcmToken: true },
      });

      const fcmTokens = consumerTokensResult?.fcmToken ?? null;
      // Normalize fcmTokens to string[] to match the expected parameter type
      const fcmTokenArray: string[] = Array.isArray(fcmTokens)
        ? fcmTokens
        : fcmTokens
          ? [fcmTokens]
          : [];

      if (fcmTokenArray.length > 0) {
        try {
          await this.firebase.sendPushNotification(
            fcmTokenArray,
            'Job Completed',
            'Your job has been marked as completed by the service provider.',
            { jobId: orderExists.id },
          );
        } catch (err) {
          this.logger.error(`Failed to send push notification for order ${orderExists.id}: ${err instanceof Error ? err.message : err}`);
        }
      } else {
        this.logger.log(`No FCM tokens found for user ${orderExists.consumerId}, skipping push notification`);
      }

      this.logger.log(`Transfer created successfully for amount: ${dto.amountCents}`);
      return ApiResponse.success(orderUpdate, 'Transfer created successfully');
    } catch (error) {
      this.logger.error(`Failed to create transfer for amount: ${dto.amountCents}`, error);
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create transfer');
    }
  }

  async refundCharge(dto: RefundDto) {
    try {
      const orderExists = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
      if (!orderExists) {
        this.logger.warn(`Order not found: ${dto.orderId}`);
        throw new NotFoundException('Order not found');
      }
      const captureIntent = await this.stripe.paymentIntents.retrieve(orderExists.paymentIntentId);
      if (captureIntent.status !== 'succeeded') {
        this.logger.warn(`Payment intent not succeeded for order: ${dto.orderId}`);
        throw new NotFoundException('Payment intent not succeeded, cannot process refund');
      }
      
      // Validate refund amount doesn't exceed charge amount
      const refundAmount = parseInt(dto.amount, 10);
      const chargeAmount = captureIntent.amount;
      
      if (refundAmount > chargeAmount) {
        this.logger.warn(`Refund amount (${refundAmount}) exceeds charge amount (${chargeAmount}) for order: ${dto.orderId}`);
        throw new BadRequestException(
          `Refund amount ($${(refundAmount / 100).toFixed(2)}) cannot exceed the charge amount ($${(chargeAmount / 100).toFixed(2)})`
        );
      }
      
      const refund = await this.stripe.refunds.create({
        payment_intent: orderExists.paymentIntentId,
        amount: refundAmount,
      });
      if (refund.status === 'succeeded') {
        await this.prisma.order.update({
          where: { id: dto.orderId },
          data: { status: 'CANCELLED' },
        });
      }
      await this.prisma.notification.create({
        data: {
          fromNotification: 'SYSTEM',
          toNotification: orderExists.consumerId,
          message: `A refund of $${(refundAmount / 100).toFixed(2)} has been processed for your order ${dto.orderId}.`,
          createdAt: new Date(),
        }
      });
      this.logger.log(`Refund processed successfully for pi: ${orderExists.paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`Failed to process refund for orderId: ${dto.orderId}`, error);
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } 
      throw new Error(error  instanceof Error ? error.message : 'Failed to process refund');
      
    }
  }
}
