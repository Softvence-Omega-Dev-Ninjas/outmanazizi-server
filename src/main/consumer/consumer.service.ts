import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AcceptBid } from './dto/create-consumer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class ConsumerService {
  private readonly logger = new Logger(ConsumerService.name);
  constructor(private readonly prisma: PrismaService) { }

  async getBidedProviders(userid: string, serviceId: string) {
    this.logger.log(`Fetching bided providers for user: ${userid}, service: ${serviceId}`);
    try {
      const bidedProviders = await this.prisma.bid.findMany({
        where: { consumerId: userid, serviceId: serviceId },
        include: {
          serviceProvider: {
            select: {
              id: true,
              myCurrentRating: true,
              ratingGetFromUsers: true,
              user: {
                select: {
                  name: true,
                  picture: true,
                },
              },
            },
          },
        },
        // orderBy: { serviceProvider: { myCurrentRating: 'desc' } },
      });
      this.logger.log(`Fetched ${bidedProviders.length} bided providers for service: ${serviceId}`);
      return ApiResponse.success(bidedProviders, 'Bided providers fetched successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Failed to fetch bided providers for service: ${serviceId}`, error);
      return ApiResponse.error('Failed to fetch bided providers', message);
    }
  }
  // remove bid
  async removeBid(userid: string, serviceId: string, serviceProviderId: string) {
    this.logger.log(`User ${userid} is removing a bid for service ${serviceId}`);

    try {
      const bidToRemove = await this.prisma.bid.findFirst({
        where: {
          AND: [
            { serviceId },
            { serviceProviderId },
            { consumerId: userid },
          ],
        },
      });
      if (!bidToRemove) {
        this.logger.error(`Bid not found for user ${userid}, service ${serviceId}, provider ${serviceProviderId}`);
        throw new BadRequestException('Bid not found');
      }
      await this.prisma.bid.delete({
        where: { id: bidToRemove.id },
      });
      this.logger.log(`Bid for service ${serviceId} removed by user ${userid}`);
      return { message: 'Bid removed successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Failed to remove bid for service ${serviceId} by user ${userid}`, error);
      throw new BadRequestException(message);
    }
  }
  async acceptBid(userid: string, serviceId: string, createConsumerDto: AcceptBid) {
    this.logger.log(`User ${userid} is accepting a bid for service ${serviceId}`);
    try {
      // check if the user is the owner of the service request
      const validConsumer = await this.prisma.service.findFirst({
        where: { id: serviceId, userId: userid },
      });

      if (!validConsumer) {
        this.logger.error(`User ${userid} is not the owner of service ${serviceId}`);
        throw new BadRequestException('You are not the owner of this service');
      }
      const serviceRequest = await this.prisma.bid.findFirst({
        where: {
          AND: [{ serviceId }, { serviceProviderId: createConsumerDto.serviceProviderId }],
        },
      });
      if (!serviceRequest) {
        this.logger.error(`Service request not found for user ${userid} and service ${serviceId}`);
        throw new BadRequestException('Service request not with this service provider id ');
      }
      // check if the bid is already accepted
      if (serviceRequest.status === 'ACCEPTED') {
        this.logger.error(`Bid for service ${serviceId} is already accepted`);
        throw new BadRequestException('Bid is already accepted by another provider');
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
      this.logger.log(`Bid for service ${serviceId} accepted by user ${userid}`);
      return {
        message: 'Bid accepted successfully',
        data: { updatedBid, assingedServiceRequest },
      };
    } catch (error) {
      this.logger.error(`Failed to accept bid for service ${serviceId} by user ${userid}`, error);
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
  // get specific service provider information
  async getServiceProviderInfo(serviceProviderId: string) {
    this.logger.log(`Fetching service provider info for ID: ${serviceProviderId}`);
    try {
      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { id: serviceProviderId },
        include: {
          user: {
            select: {
              name: true,
              picture: true,
              email: true,
              toReviews: {
                include: {
                  fromReview: { select: { name: true, picture: true } }
                }
              }

            },

          },
        },
      });
      if (!serviceProvider) {
        this.logger.error(`Service provider not found for ID: ${serviceProviderId}`);
        throw new BadRequestException('Service provider not found');
      }
      this.logger.log(`Fetched service provider info for ID: ${serviceProviderId}`);
      return ApiResponse.success(serviceProvider, 'Service provider info fetched successfully');
    } catch (error) {
      this.logger.error(`Failed to fetch service provider info for ID: ${serviceProviderId}`, error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return ApiResponse.error('Failed to fetch service provider info', message);
    }
  }
}