import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { Role } from '@prisma/client';

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
    try {
      const orders = await this.prisma.order.findMany({});
      return ApiResponse.success(
        orders,
        'All orders fetched successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }
  async findOrderDetails(orderId: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          bid: {
            include: {
              serviceProvider: {
                include: {
                  user: true,
                },
              },
              service: true,
            },
          },
          consumer: true,
        },
      });
      if (!order) {
        throw new UnauthorizedException('Order not found');
      }
      return ApiResponse.success(
        order,
        'Order details fetched successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
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


  // create platform fee
  async createPlatformFee(amount: number) {
    try {
      const existingFee = await this.prisma.platformFee.findMany({});

      if (existingFee.length > 0) {
        throw new UnauthorizedException('Platform fee already exists');
      }
      const platformFee = await this.prisma.platformFee.create({
        data: {
          amount: amount,
        },
      });
      return ApiResponse.success(
        platformFee,
        'Platform fee created successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
    // get platform fee

  }
  async getPlatformFee() {
    try {
      const platformFee = await this.prisma.platformFee.findMany({});
      return ApiResponse.success(
        platformFee,
        'Platform fee fetched successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }


  // update a platform fee 
  async updatePlatformFee(id: string, fee: number) {
    try {
      const existingFee = await this.prisma.platformFee.update({
        where: {
          id: id
        },
        data: {
          amount: fee
        }
      })
      return ApiResponse.success(
        existingFee,
        'Platform fee updated successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }
  // delete a platform fee
  async deletePlatformFee(id: string) {
    try {
      const deletedFee = await this.prisma.platformFee.delete({
        where: {
          id: id
        }
      })
      return ApiResponse.success(
        deletedFee,
        'Platform fee deleted successfully',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }

}
