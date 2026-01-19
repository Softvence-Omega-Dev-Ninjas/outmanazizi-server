import { HttpException, Injectable, InternalServerErrorException, Logger, UnauthorizedException, } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { Role } from '@prisma/client';
import { MailService } from "src/utils/mail/mail.service";
import { ServiceProviderStatus } from 'src/main/auth/role.enum';
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  constructor(private readonly prisma: PrismaService ,  
    private readonly mailService: MailService) { }

  async serviceProviderVerification(userid: string) {
  try {
      const userExits = await this.prisma.user.findUnique({
      where: { id: userid },
      include: { serviceProvider: true },
    });
    if (!userExits) {
      throw new UnauthorizedException('User does not exists');
    }
    if (userExits.role !== 'SERVICE_PROVIDER') {
      throw new UnauthorizedException('User is not a service provider');
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
          update: { isVerifiedFromAdmin: true },
        },

      },
    });
    return ApiResponse.success(verifiedUser, 'User is verified successfully');
  } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
  }
  }

 


  // change user status 
  async changeUserStatus(userid: string, status: ServiceProviderStatus, message?: string) {
    try {
      const userExits = await this.prisma.user.findUnique({
      where: { id: userid },
    });
    if (!userExits) {
      throw new UnauthorizedException('User does not exists');
    }
    if (userExits.isDeleted) {
      throw new UnauthorizedException('User account is already deleted');
    }
    const updatedUser = await this.prisma.serviceProvider.update({
      where: { userId: userid },
      data: {
       status 
      },
    });
    if (status === ServiceProviderStatus.APPROVED) {
        await this.prisma.user.update({
        where: { id: userid },
        data: {
          serviceProvider: {
            update: { isVerifiedFromAdmin: true },
          },
        },
      });
     await this.mailService.sendMail(
        userExits.email,
        'Service Provider Verification Approved',
        `Dear ${userExits.name},\n\nCongratulations! Your service provider verification has been approved. You can now access all the features and benefits of being a verified service provider on our platform.\n\nBest regards,\nSupport Team`,
      );
    }
    if (status === ServiceProviderStatus.REJECTED) {
         await this.mailService.sendMail(
        userExits.email,
        'Service Provider Verification Rejected',
        `Dear ${userExits.name},\n\nWe regret to inform you that your service provider verification has been rejected for the following reason:\n\n${message}\n\nPlease review the requirements and feel free to reapply once you have addressed the issues mentioned above.\n\nBest regards,\nSupport Team`,
      );
    }
    return ApiResponse.success(updatedUser, 'User status is changed successfully');
    } catch (error) {
      this.logger.error('Failed to change user status', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change user status');
    }
  }


  // Get all users with proper details
  async findAll() {
    const allUser = await this.prisma.user.findMany({
      include: { serviceProvider: true },
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(allUser, 'All users fetched successfully');
  }

   

  async blockedUser(id: string) {
  try {
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
  } catch (error) {
      this.logger.error('Failed to block/unblock user', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to block/unblock user');
  }
  }
  // account deletion by admin
  async deleteUser(id: string) {
    try {
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
    } catch (error) {
      this.logger.error('Failed to delete user account', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user account');
    }
  }

  // Delete a service, which is created by service provider
  async deleteService(serviceid: string) {
    try {
      const serviceExits = await this.prisma.service.findUnique({
      where: { id: serviceid, },
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
    } catch (error) {
      this.logger.error('Failed to delete service', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete service');
    }
  }
  // find all serviceProvider
  async findAllServiceProvider() {
  try {
      const serviceProviders = await this.prisma.serviceProvider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return ApiResponse.success(
      serviceProviders,
      'All service providers fetched successfully',
    );
  } catch (error) {
      this.logger.error('Failed to fetch service providers', error);
      throw new InternalServerErrorException('Failed to fetch service providers');
  }
  }
  async findAllOrders() {
    try {
      const orders = await this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          bid: {
            include: {
              service: {
                select: {
                  isCompletedFromServiceProvider: true,
                  isCompleteFromConsumer: true,
                },
              },
            },
          },
        },
      });
      
      // Map the orders to include completion status dynamically
      const ordersWithCompletionStatus = orders.map(order => ({
        ...order,
        isCompletedFromProvider: order.bid.service.isCompletedFromServiceProvider,
        isCompletedFromConsumer: order.bid.service.isCompleteFromConsumer,
      }));
      
      return ApiResponse.success(
        ordersWithCompletionStatus,
        'All orders fetched successfully',
      );
    } catch (error) {
      this.logger.error('Failed to fetch orders', error);
      throw new InternalServerErrorException('Failed to fetch orders');
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
      this.logger.error('Failed to fetch order details', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch order details');
    }
  }
  async changeUserRole(userid: string, role: Role) {
    try {
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
    } catch (error) {
      this.logger.error('Failed to change user role', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change user role');
    }
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
      this.logger.error('Failed to create platform fee', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create platform fee');
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
      this.logger.error('Failed to fetch platform fee', error);
      throw new InternalServerErrorException('Failed to fetch platform fee');
    }
  }


  // update a platform fee 
  async updatePlatformFee(id: string, fee: number) {
    try {

      const platformFee = await this.prisma.platformFee.findUnique({
        where: {
          id: id
        }
      })

      if (!platformFee) {
        throw new UnauthorizedException('Platform fee does not exist');
      }
      
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
      this.logger.error('Failed to update platform fee', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update platform fee');
    }
  }
  // delete a platform fee
  async deletePlatformFee(id: string) {
    try {
      const platformFee = await this.prisma.platformFee.findUnique({
        where: {
          id: id
        }
      })

      if (!platformFee) {
        throw new UnauthorizedException('Platform fee does not exist');
      }
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
      this.logger.error('Failed to delete platform fee', error);
      if (error instanceof HttpException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete platform fee');
    }
  }

}
