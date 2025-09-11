import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { UpdateServiceProviderDto } from './dto/update-service-provider.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';

@Injectable()
export class ServiceProviderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async create(
    userid: string,
    createServiceProviderDto: CreateServiceProviderDto,
  ) {
    try {
      // user exists check
      const user = await this.helperService.userExistsByUserid(userid);
      if (!user) {
        throw new NotFoundException('user not found');
      }

      const serviceProvider = await this.prisma.serviceProvider.upsert({
        where: { userId: userid },
        create: {
          userId: userid,
          address: createServiceProviderDto.address,
          serviceArea: createServiceProviderDto.serviceArea,
          serviceCategories: createServiceProviderDto.serviceCategories,
        },
        update: {
          address: createServiceProviderDto.address,
          serviceArea: createServiceProviderDto.serviceArea,
          serviceCategories: createServiceProviderDto.serviceCategories,
        },
      });
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

  findAll() {
    return `This action returns all serviceProvider`;
  }

  findOne(id: number) {
    return `This action returns a #${id} serviceProvider`;
  }

  update(id: number, updateServiceProviderDto: UpdateServiceProviderDto) {
    return `This action updates a #${id} serviceProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} serviceProvider`;
  }
}
