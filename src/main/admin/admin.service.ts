import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { Role } from '@prisma/client';
import { UpdateLocationDto } from './dto/update.location.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService) { }
  async serviceProviderVerification(userid: string) {
    const userExits = await this.prisma.user.findUnique({
      where: { id: userid },
      include: { serviceProvider: true },
    });
    if (!userExits) {
      return { message: 'User does not exists' };
    }
    if (userExits.role !== 'SERVICE_PROVIDER') {
      return { message: 'User is not a service provider' };
    }
    if (userExits.isDeleted) {
      throw new UnauthorizedException('User account is already deleted');
    }
    if (userExits.isBlocked) {
      throw new UnauthorizedException('User account is already blocked');
    }
    if (userExits.isActive === false) {
      throw new UnauthorizedException('User account is  not active');
    }

    if (!userExits.serviceProvider) {
      throw new UnauthorizedException('Service provider details not found for this user');
    }

    const verifiedUser = await this.prisma.user.update({
      where: { id: userid },
      data: {
        serviceProvider: {
          update: { isVerifiedFromAdmin: !userExits.serviceProvider.isVerifiedFromAdmin },
        },

      },
    });
    return ApiResponse.success(verifiedUser, 'User is verified successfully');
  }

  // Get all users with proper details
  async findAll() {
    const allUser = await this.prisma.user.findMany({
      include: { serviceProvider: true },
    });
    return ApiResponse.success(allUser, 'All users fetched successfully');
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async blockedUser(id: string) {
    const userExits = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!userExits) {
      throw new UnauthorizedException('User does not exists');
    }
    if (userExits.isDeleted) {
      throw new UnauthorizedException('User account is already deleted');
    }
    const blockedUser = await this.prisma.user.update({
      where: { id: id },
      data: {
        isBlocked: !userExits.isBlocked,
      },
    });
    return ApiResponse.success(blockedUser, 'User is blocked successfully');
  }
  // account deletion by admin
  async deleteUser(id: string) {
    const userExits = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!userExits) {
      throw new UnauthorizedException('User does not exists');
    }
    const deletedUser = await this.prisma.user.update({
      where: { id: id },
      data: {
        isDeleted: true,
      },
    });
    return ApiResponse.success(
      deletedUser,
      'User account is deleted successfully',
    );
  }

  // Delete a service, which is created by service provider
  async deleteService(serviceid: string) {
    const serviceExits = await this.prisma.service.findUnique({
      where: { id: serviceid },
    });
    if (!serviceExits) {
      throw new UnauthorizedException('Service does not exists');
    }
    if (serviceExits.isDeleteRequestToAdmin === false) {
      throw new UnauthorizedException(
        'Service deletion request is not sent to admin',
      );
    }
    const deletedService = await this.prisma.service.delete({
      where: { id: serviceid },
    });
    return ApiResponse.success(
      deletedService,
      'Service is deleted successfully',
    );
  }
  // find all serviceProvider
  async findAllServiceProvider() {
    const serviceProviders = await this.prisma.serviceProvider.findMany({});
    return ApiResponse.success(
      serviceProviders,
      'All service providers fetched successfully',
    );
  }
  async findAllOrders() {
    const orders = await this.prisma.order.findMany({});
    return ApiResponse.success(
      orders,
      'All orders fetched successfully',
    );


  }
  async changeUserRole(userid: string, role: Role) {
    const userExits = await this.prisma.user.findUnique({
      where: { id: userid },
    });
    if (!userExits) {
      throw new UnauthorizedException('User does not exists');
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userid },
      data: {
        role: role,
      },
    });
    return ApiResponse.success(
      updatedUser,
      'User role is updated successfully',
    );
  }
  async updateUserLocation(locationId: string, dto: UpdateLocationDto) {
    this.logger.log(`Updating location with ID: ${locationId}`);
    try {
      const locationExists = await this.prisma.area.findUnique({
        where: { id: locationId },
      });
      if (!locationExists) {
        throw new UnauthorizedException('Location does not exists');
      }
      const updatedLocation = await this.prisma.area.update({
        where: { id: locationId },
        data: {
          ...dto,
        },
      });
      return ApiResponse.success(updatedLocation, 'Location updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }

  async deleteUserLocation(locationId: string) {
    this.logger.log(`Deleting location with ID: ${locationId}`);
    try {
      const locationExists = await this.prisma.area.findUnique({
        where: { id: locationId },
      });
      if (!locationExists) {
        throw new UnauthorizedException('Location does not exists');
      }
      const deletedLocation = await this.prisma.area.delete({
        where: { id: locationId },
      });
      return ApiResponse.success(deletedLocation, 'Location deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }






}
