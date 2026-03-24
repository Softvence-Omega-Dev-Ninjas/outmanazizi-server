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

  private getErrorTrace(error: unknown): string {
    if (error instanceof Error) {
      return error.stack ?? error.message;
    }
    return String(error);
  }

  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly firebase: FirebaseService,
  ) { }

  async makeCustomer(userId: string, makeCustomerDto: MakeCustomerDto) {
    this.logger.log(`makeCustomer:start userId=${userId}`);
    this.logger.debug(`makeCustomer:payload userId=${userId} hasCustomerId=${Boolean(makeCustomerDto.customerIdFromStripe)} hasPaymentMethodId=${Boolean(makeCustomerDto.paymentMethodIdFromStripe)}`);
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
      this.logger.log(`makeCustomer:success userId=${userId}`);
      return ApiResponse.success(res, 'Customer information updated successfully');
    } catch (error) {
      this.logger.error(`makeCustomer:failed userId=${userId}`, this.getErrorTrace(error));
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create customer');
    }
  }
  
  async createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    this.logger.log(`createPaymentIntent:start userId=${userId} bidId=${dto.bidId} amount=${dto.amount}`);
    this.logger.debug(`createPaymentIntent:payload userId=${userId} applicationFeePersent=${dto.applicationFeePersent}`);
    try {
      const userExistsByUserid = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      const bidExists = await this.prisma.bid.findUnique({
        where: { id: dto.bidId },
        include: {
          serviceProvider: {
            include: {
              user: true,
            },
          },
        },
      })
      const persentExists = await this.prisma.platformFee.findFirst({
        where: { amount: dto.applicationFeePersent },
      })
      this.logger.debug(`createPaymentIntent:lookup userFound=${Boolean(userExistsByUserid)} bidFound=${Boolean(bidExists)} platformFeeFound=${Boolean(persentExists)}`);
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
        currency: 'mad', 
        metadata: { userId },
        payment_method_types: ['card'],
        customer: userExistsByUserid.customerIdFromStripe,
        payment_method: userExistsByUserid.paymentMethodIdFromStripe,
        confirm: true, 
      });

      this.logger.log(`createPaymentIntent:stripePaymentIntentCreated userId=${userId} paymentIntentId=${paymentIntent.id}`);


      
      const oder = await this.prisma.order.create({
        data: {
          serviceProviderId: bidExists.serviceProvider.id,
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
          toNotification: bidExists.serviceProvider.userId,
          message: `A new order has been created for your bid ${dto.bidId}.`,
          createdAt: new Date(),
        }
      })
      this.logger.debug(`createPaymentIntent:dbWriteComplete orderId=${oder.id} notificationTo=${bidExists.serviceProvider.userId}`);
      this.logger.log(`createPaymentIntent:success userId=${userId} orderId=${oder.id} paymentIntentId=${paymentIntent.id}`);
      return ApiResponse.success(oder, 'Payment intent created successfully');
    } catch (error) {
      this.logger.error(`createPaymentIntent:failed userId=${userId} bidId=${dto.bidId}`, this.getErrorTrace(error));
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  async createTransfer(userId: string, dto: CreateTransferDto) {
    this.logger.log(`createTransfer:start userId=${userId} orderId=${dto.orderId} amountCents=${dto.amountCents}`);
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
      this.logger.debug(`createTransfer:lookup userFound=${Boolean(userExist)} orderFound=${Boolean(orderExists)} bidFound=${Boolean(bidExists)}`);
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
      this.logger.debug(`createTransfer:sellerAccountRetrieved accountId=${stripeAccountId} transfersCapability=${sellerAccount?.capabilities?.transfers}`);
      if (!sellerAccount) {
        this.logger.warn(`Seller account not found: ${stripeAccountId}`);
        throw new NotFoundException('Seller account not found');
      }
      if (sellerAccount?.capabilities?.transfers !== 'active') {
        throw new NotFoundException('Seller account is not ready for transfers');
      }

      const transfer = await this.stripe.transfers.create({
        amount: dto.amountCents,
        currency: 'mad', 
        destination: stripeAccountId,
      });

      this.logger.log(`createTransfer:stripeTransferCreated orderId=${dto.orderId} transferId=${transfer.id} destination=${stripeAccountId}`);

      const orderUpdate = await this.prisma.order.update({
        where: {
          id: dto.orderId
        },
        data: {
          status: 'COMPLETED'
        }
      });


        await this.prisma.service.update({
          where:{
            id: bidExists.serviceId
          },data:{
            isCompletedFromAdmin:true
          }
        })
      this.logger.log(`Service status updated for service: ${bidExists.serviceId}`);

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
      this.logger.debug(`createTransfer:notificationEventEmitted orderId=${orderExists.id} toServiceProvider=${bidExists.serviceProviderId}`);
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
      this.logger.debug(`createTransfer:fcmTokensResolved consumerId=${orderExists.consumerId} tokenCount=${fcmTokenArray.length}`);

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
      this.logger.error(`createTransfer:failed userId=${userId} orderId=${dto.orderId}`, this.getErrorTrace(error));
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create transfer');
    }
  }

  async refundCharge(dto: RefundDto) {
    this.logger.log(`refundCharge:start orderId=${dto.orderId} amount=${dto.amount}`);
    try {
      const orderExists = await this.prisma.order.findUnique({
        where: { id: dto.orderId },
      });
      if (!orderExists) {
        this.logger.warn(`Order not found: ${dto.orderId}`);
        throw new NotFoundException('Order not found');
      }
      const captureIntent = await this.stripe.paymentIntents.retrieve(orderExists.paymentIntentId);
      this.logger.debug(`refundCharge:paymentIntentRetrieved orderId=${dto.orderId} paymentIntentId=${orderExists.paymentIntentId} status=${captureIntent.status}`);
      if (captureIntent.status !== 'succeeded') {
        this.logger.warn(`Payment intent not succeeded for order: ${dto.orderId}`);
        throw new NotFoundException('Payment intent not succeeded, cannot process refund');
      }
      
      // Validate refund amount doesn't exceed charge amount
      const refundAmount = parseInt(dto.amount, 10);
      const chargeAmount = captureIntent.amount;
      this.logger.debug(`refundCharge:amountValidation orderId=${dto.orderId} refundAmount=${refundAmount} chargeAmount=${chargeAmount}`);
      
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
      this.logger.log(`refundCharge:stripeRefundCreated orderId=${dto.orderId} refundId=${refund.id} status=${refund.status}`);
      if (refund.status === 'succeeded') {
        await this.prisma.order.update({
          where: { id: dto.orderId },
          data: { status: 'CANCELLED' },
        });
      }
      // Get the service provider's user ID to send the refund notification
      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: orderExists.serviceProviderId },
      });
      
      if (serviceProvider) {
        await this.prisma.notification.create({
          data: {
            fromNotification: serviceProvider.userId,
            toNotification: orderExists.consumerId,
            message: `A refund of $${(refundAmount / 100).toFixed(2)} has been processed for your order ${dto.orderId}.`,
            createdAt: new Date(),
          }
        });
      }
      this.logger.log(`refundCharge:success orderId=${dto.orderId} paymentIntentId=${orderExists.paymentIntentId}`);
      return refund;
    } catch (error) {
      this.logger.error(`refundCharge:failed orderId=${dto.orderId}`, this.getErrorTrace(error));
      if (error instanceof HttpException || error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      } 
      throw new Error(error  instanceof Error ? error.message : 'Failed to process refund');
    }
  }
}
