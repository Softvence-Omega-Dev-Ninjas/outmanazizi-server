import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
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
      throw new UnauthorizedException('User account is already not active');
    }
    if (userExits.serviceProvider?.isVerifiedFromAdmin === true) {
      throw new UnauthorizedException('User is already verified');
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
  }

  findAll() {
    return `This action returns all admin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
