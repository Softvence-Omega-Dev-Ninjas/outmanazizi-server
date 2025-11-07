import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AcceptBid } from './dto/create-consumer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);
  constructor(private readonly prisma: PrismaService) { }

  // bidded providers for a service request
  async getBidedProviders(userid: string, serviceId: string) {
    try {
      const bidedProviders = await this.prisma.bid.findMany({
        where: { consumerId: userid, serviceId: serviceId },
        include: { serviceProvider: { include: { user: true } } },
        orderBy: { serviceProvider: { myCurrentRating: 'desc' } },
      });

      return ApiResponse.success(bidedProviders, 'Bided providers fetched successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return ApiResponse.error('Failed to fetch bided providers', message);
    }
  }

  async acceptBid(userid: string, serviceId: string, createConsumerDto: AcceptBid) {
    try {
      // check if the user is the owner of the service request
      const validConsumer = await this.prisma.service.findFirst({
        where: { id: serviceId, userId: userid },
      });
      if (!validConsumer) {
        throw new BadRequestException('You are not the owner of this service');
      }
      const serviceRequest = await this.prisma.bid.findFirst({
        where: {
          AND: [{ serviceId }, { serviceProviderId: createConsumerDto.serviceProviderId }],
        },
      });
      if (!serviceRequest) {
        throw new BadRequestException('Service request not with this service provider id ');
      }
      // check if the bid is already accepted
      if (serviceRequest.status === 'ACCEPTED') {
        throw new BadRequestException('Bid is already accepted');
      }
      // update the bid status to accepted
      const updatedBid = await this.prisma.bid.update({
        where: { id: serviceRequest.id },
        data: { status: 'ACCEPTED' },
      });
      const assingedServiceRequest = await this.prisma.service.update({
        where: { id: serviceId },
        data: {
          assignedServiceProviderId: createConsumerDto.serviceProviderId,
        },
      });
      return {
        message: 'Bid accepted successfully',
        data: { updatedBid, assingedServiceRequest },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException(message);
    }
  }

  async serviceComplete(userid: string, serviceId: string) {
    this.logger.log(`Consumer ${userid} is marking service ${serviceId} as complete`);
    try {

      // check if the user is the owner of the service request
      const validConsumer = await this.prisma.service.findFirst({
        where: { id: serviceId, userId: userid },
      });
      if (!validConsumer) {
        this.logger.error(`Consumer ${userid} is not the owner of service ${serviceId}`);
        throw new BadRequestException('You are not the owner of this service');
      }
      // check if the service is assigned to a service provider
      if (!validConsumer.assignedServiceProviderId) {
        this.logger.error(`Service ${serviceId} is not assigned to any service provider`);
        throw new BadRequestException('Service is not assigned to any service provider');
      }
      // check if the service is already completed
      if (validConsumer.isCompleteFromConsumer === true) {
        this.logger.error(`Service ${serviceId} is already completed`);
        throw new BadRequestException('Service is already completed');
      }
      // update the service status to completed
      const updatedService = await this.prisma.service.update({
        where: { id: serviceId },
        data: { isCompleteFromConsumer: true },
      });
      this.logger.log(`Service ${serviceId} marked as complete by consumer ${userid}`);
      return { message: 'Service completed successfully', updatedService };
    } catch (error) {
      this.logger.error(`Failed to complete service ${serviceId} by consumer ${userid}`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException(message);
    }
  }

  // my notifications
  async myNotifications(userid: string) {
    this.logger.log(`Fetching notifications for user: ${userid}`);
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { toNotification: userid },
        orderBy: { createdAt: 'desc' },
      });
      this.logger.log(`Fetched ${notifications.length} notifications for user: ${userid}`);
      return ApiResponse.success(notifications, 'Notifications fetched successfully');
    } catch (error) {
      this.logger.error(`Failed to fetch notifications for user: ${userid}`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return ApiResponse.error('Failed to fetch notifications', message);
    }
  }
}