import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';
import { ServiceProviderBidDto } from './dto/service-provider-bid.dto';

@Injectable()
export class ServiceProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) { }

  async create(
    userid: string,
    createServiceProviderDto: CreateServiceProviderDto,
  ) {
    try {
      // user exists check
      const user = await this.helperService.userExistsByUserid(userid);
      if (!user) {
        throw new NotFoundException('You need to register first');
      }
      const serviceAreaExists = await this.prisma.area.findMany({
        where: { id: { in: createServiceProviderDto.serviceArea } },
      });
      if (!serviceAreaExists) {
        throw new NotFoundException('Invalid service area');
      }
      const serviceCategoryExists = await this.prisma.services.findMany({
        where: { id: { in: createServiceProviderDto.serviceCategories } },
      });
      if (!serviceCategoryExists) {
        throw new NotFoundException('Invalid service category');
      }

      const serviceProvider = await this.prisma.serviceProvider.create({
        data: {
          userId: userid,
          address: createServiceProviderDto.address,
          serviceArea: serviceAreaExists.map((area) => area.area),
          serviceCategories: serviceCategoryExists.map(
            (category) => category.name,
          ),
        },
      });
      if (
        createServiceProviderDto.address &&
        createServiceProviderDto.serviceArea
      ) {
        await this.prisma.serviceProvider.update({
          where: { id: userid },
          data: { isProfileCompleted: true },
        });
      }
      await this.prisma.user.update({
        where: { id: userid },
        data: { role: 'SERVICE_PROVIDER' },
      });
      return ApiResponse.success(
        serviceProvider,
        'Service provider created successfully',
      );
    } catch (error) {
      console.log(error);
    }
  }
  // patch document upload
  async uploadDocuments(userid: string, documents: string) {
    const validServiceProvider =
      await this.helperService.validServiceProvider(userid);
    if (!validServiceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const updatedServiceProvider = await this.prisma.serviceProvider.update({
      where: { id: validServiceProvider.id },
      data: {
        documents: documents,
      },
    });
    return ApiResponse.success(
      updatedServiceProvider,
      'Documents uploaded  successfully',
    );
  }
  async findAll() {
    const result = await this.prisma.serviceProvider.findMany({});
    return ApiResponse.success(
      result,
      'Service providers retrieved successfully',
    );
  }

  async makeBid(
    userid: string,
    serviceRequestId: string,
    body: ServiceProviderBidDto,
  ) {
    const bidExists = await this.prisma.bid.findFirst({
      where: {
        serviceId: serviceRequestId,
        serviceProvider: {
          userId: userid,
        },
      },
    });
    if (bidExists) {
      throw new NotFoundException('You have already placed a bid');
    }
    const validSerivceProvider =
      await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const serviceRequest = await this.prisma.service.findUnique({
      where: { id: serviceRequestId },
    });
    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }
    const bid = await this.prisma.bid.create({
      data: {
        serviceId: serviceRequestId,
        serviceProviderId: validSerivceProvider.id,
        price: body.price,
        serviceProviderProposal: body.serviceProviderProposal ?? '',
      },
    });
    return ApiResponse.success(bid, 'Bid placed successfully');
  }

  async myBids(userid: string) {
    const validSerivceProvider =
      await this.helperService.validServiceProvider(userid);
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
    const validSerivceProvider =
      await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const service = await this.prisma.service.findFirst({
      where: {
        AND: [
          { assignedServiceProviderId: validSerivceProvider.id },
          { id: serviceId },
        ],
      },
    });
    if (!service) {
      throw new NotFoundException('Service not found or not assigned to you');
    }
    const updatedService = await this.prisma.service.update({
      where: { id: serviceId },
      data: { isCompletedFromServiceProvider: true },
    });
    return ApiResponse.success(
      updatedService,
      'Service marked as completed from service provider, and waiting for consumer confirmation',
    );
  }

  async myAllBids(userid: string) {
    const validSerivceProvider =
      await this.helperService.validServiceProvider(userid);
    if (!validSerivceProvider) {
      throw new NotFoundException('Invalid service provider');
    }
    const bids = await this.prisma.bid.findMany({
      where: { serviceProviderId: validSerivceProvider.id },
    });
    return ApiResponse.success(bids, 'Bids retrieved successfully');
  }

  // my accepted bids
  async myAcceptedBids(userid: string) {
    const validSerivceProvider =
      await this.helperService.validServiceProvider(userid);
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
