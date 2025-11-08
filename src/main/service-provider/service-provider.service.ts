import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';
import { ServiceProviderBidDto } from './dto/service-provider-bid.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ServiceProviderService {
  logger = new Logger(ServiceProviderService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    if (!this.prisma) {
      throw new Error('PrismaService not initialized');
    }
  }

  async create(userid: string, createServiceProviderDto: CreateServiceProviderDto) {
    this.logger.log(`Creating service provider profile for user: ${userid}`);
    try {
      // user exists check
      const user = await this.helperService.userExistsByUserid(userid);

      if (!user) {
        this.logger.error(`User not found: ${userid}`);
        throw new NotFoundException('You need to register first');
      }
      const serviceProviderExists = await this.prisma.serviceProvider.findFirst({
        where: { userId: user.id },
      });
      if (!serviceProviderExists) {
        this.logger.error(`Service provider not found for user: ${userid}`);
        throw new NotFoundException('Service provider not found');
      }

      const serviceAreas: { id: string }[] = await this.prisma.area.findMany({
        where: {
          id: { in: createServiceProviderDto.serviceArea },
        },
        select: { id: true },
      });

      if (serviceAreas.length !== createServiceProviderDto.serviceArea.length) {
        this.logger.error(`One or more service areas are invalid for user: ${userid}`);
        throw new NotFoundException('One or more service areas are invalid');
      }
      const serviceCategories: { id: string }[] = await this.prisma.services.findMany({
        where: {
          id: { in: createServiceProviderDto.serviceCategories },
        },
        select: { id: true },
      });

      if (serviceCategories.length !== createServiceProviderDto.serviceCategories.length) {
        this.logger.error(`One or more service categories are invalid for user: ${userid}`);
        throw new NotFoundException('One or more service categories are invalid');
      }

      const newServiceProvider = await this.prisma.serviceProvider.update({
        where: { id: serviceProviderExists.id },
        data: {
          address: createServiceProviderDto.address,
          serviceArea: {
            set: serviceAreas.map((area) => area.id),
          },
          serviceCategories: {
            set: serviceCategories.map((category) => category.id),
          },
        },
      });
      this.logger.log(`Service provider profile created successfully for user: ${userid}`);
      return ApiResponse.success(
        newServiceProvider,
        'Service provider profile created successfully',
      );
    } catch (error) {
      this.logger.error(`Error creating service provider profile for user: ${userid} - ${error instanceof Error ? error.message : 'An error occurred'}`);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create service provider profile');
    }
  }
  async currentServiceProvider(userid: string) {
    this.logger.log(`Fetching current service provider for user: ${userid}`);
    try {
      const validServiceProvider = await this.helperService.validServiceProvider(userid);
      if (!validServiceProvider) {
        this.logger.error(`Service provider not found for user: ${userid}`);
        throw new NotFoundException('Service provider not found');
      }
      this.logger.log(`Current service provider retrieved successfully for user: ${userid}`);
      return ApiResponse.success(
        validServiceProvider,
        'Current service provider retrieved successfully',
      );
    } catch (error) {
      this.logger.error(`Error fetching current service provider for user: ${userid} - ${error instanceof Error ? error.message : 'An error occurred'}`);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException(message);
    }
  }
  // patch document upload
  async uploadDocuments(userid: string, documents: string) {
    this.logger.log(`Uploading documents for user: ${userid}`);
    try {
      const validServiceProvider = await this.helperService.validServiceProvider(userid);
      if (!validServiceProvider) {
        this.logger.error(`Service provider not found for user: ${userid}`);
        throw new NotFoundException('Invalid service provider');
      }
      const updatedServiceProvider = await this.prisma.serviceProvider.update({
        where: { id: validServiceProvider.id },
        data: {
          documents: documents,
        },
      });
      this.logger.log(`Documents uploaded successfully for user: ${userid}`);
      return ApiResponse.success(updatedServiceProvider, 'Documents uploaded  successfully');
    } catch (error) {
      this.logger.error(`Error uploading documents for user: ${userid} - ${error instanceof Error ? error.message : 'An error occurred'}`);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException('Document upload failed', message);
    }
  }
  async findAll() {
    this.logger.log('Fetching all service providers');
    try {
      const result = await this.prisma.serviceProvider.findMany({});
      return ApiResponse.success(result, 'Service providers retrieved successfully');
    } catch (error) {
      this.logger.error(`Error fetching service providers - ${error instanceof Error ? error.message : 'An error occurred'}`);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException('Failed to retrieve service providers', message);
    }
  }

  async makeBid(userid: string, serviceRequestId: string, body: ServiceProviderBidDto) {
    this.logger.log(`Service provider ${userid} is making a bid for service request ${serviceRequestId}`);
    const bidExists = await this.prisma.bid.findFirst({
      where: {
        serviceId: serviceRequestId,
        serviceProvider: {
          userId: userid,
        },
      },
    });
    if (bidExists) {
      this.logger.error(`Bid already exists for service provider ${userid} on service request ${serviceRequestId}`);
      throw new NotFoundException('You have already placed a bid');
    }
    const validSerivceProvider = await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      this.logger.error(`Invalid service provider: ${userid}`);
      throw new NotFoundException('Invalid service provider id');
    }
    const serviceRequest = await this.prisma.service.findUnique({
      where: { id: serviceRequestId },
    });
    if (!serviceRequest) {
      this.logger.error(`Service request not found: ${serviceRequestId}`);
      throw new NotFoundException('Service request not found');
    }
    const bid = await this.prisma.bid.create({
      data: {
        serviceId: serviceRequestId,
        serviceProviderId: validSerivceProvider.id,
        consumerId: serviceRequest.userId,
        price: body.price,
        serviceProviderProposal: body.serviceProviderProposal ?? '',
      },
    });
    this.logger.log(`Bid placed successfully by service provider ${userid} for service request ${serviceRequestId}`);
    return ApiResponse.success(bid, 'Bid placed successfully');
  }

  async myBids(userid: string) {
    const validSerivceProvider = await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const bids = await this.prisma.bid.findMany({
      where: { serviceProviderId: validSerivceProvider.id },
      include: {
        service: true,
      },
    });
    return ApiResponse.success(bids, 'Bids retrieved successfully');
  }

  async workComplete(userid: string, serviceId: string) {
    try {
      this.logger.log(`Service provider ${userid} is marking work complete for service ${serviceId}`);
      const validSerivceProvider = await this.helperService.validServiceProvider(userid);
      if (!validSerivceProvider) {
        this.logger.error(`Invalid service provider: ${userid}`);
        throw new NotFoundException('Invalid service provider');
      }
      const service = await this.prisma.service.findFirst({
        where: {
          AND: [{ assignedServiceProviderId: validSerivceProvider.id }, { id: serviceId }],
        },
      });
      if (!service) {
        this.logger.error(`Service not found or not assigned to service provider ${userid}: ${serviceId}`);
        throw new NotFoundException('Service not found or not assigned to you');
      }
      const updatedService = await this.prisma.service.update({
        where: { id: serviceId },
        data: { isCompletedFromServiceProvider: true },
      });
      this.logger.log(`Service ${serviceId} marked as completed by service provider ${userid}`);
      this.eventEmitter.emit(
        'Notification',
        { fromNotification: userid, jobId: updatedService.id, toNotification: service.userId },
      );
      return ApiResponse.success(
        updatedService,
        'Service marked as completed from service provider, and waiting for consumer confirmation',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error marking service ${serviceId} as complete: ${message}`);
      throw new InternalServerErrorException('Error marking service as complete');
    }
  }
  async myAllBids(userid: string) {
    try {
      const validSerivceProvider = await this.helperService.validServiceProvider(userid);
      if (!validSerivceProvider) {
        throw new NotFoundException('Invalid service provider');
      }
      const bids = await this.prisma.bid.findMany({
        where: { serviceProviderId: validSerivceProvider.id },
      });
      return ApiResponse.success(bids, 'Bids retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error retrieving bids for service provider ${userid}: ${message}`);
      throw new BadRequestException(message);
    }
  }

  // my accepted bids
  async myAcceptedBids(userid: string) {
    const validSerivceProvider = await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const bids = await this.prisma.bid.findMany({
      where: {
        serviceProviderId: validSerivceProvider.id,
        status: 'ACCEPTED',
        service: {
          isCompletedFromServiceProvider: true,
          isCompleteFromConsumer: true,
        },
      },
      include: {
        service: true,
      },
    });
    return ApiResponse.success(bids, 'Accepted bids retrieved successfully');
  }
}
