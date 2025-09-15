import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaDto, CreateServicesDto } from '../dto/areaAndServices.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class AreaAndservicesService {
  constructor(private readonly prisma: PrismaService) {}
  // create area and services

  async createArea(body: CreateAreaDto) {
    try {
      const areaExists = await this.prisma.area.findFirst({
        where: { area: body.area },
      });
      if (areaExists) {
        throw new BadRequestException('Area  already exists');
      }

      const areaAndServices = await this.prisma.area.create({
        data: {
          area: body.area,
        },
      });
      return ApiResponse.success(areaAndServices, 'Area created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async createServices(body: CreateServicesDto) {
    try {
      const servicesExists = await this.prisma.services.findFirst({
        where: { name: body.services },
      });
      if (servicesExists) {
        throw new BadRequestException('Service already exists');
      }
      if (!body.services) {
        throw new BadRequestException('Service name is required');
      }
      const services = await this.prisma.services.create({
        data: {
          name: body.services,
        },
      });
      return ApiResponse.success(services, 'Service created successfully');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllAreaAndService() {
    const area = await this.prisma.area.findMany();
    const services = await this.prisma.services.findMany();
    return ApiResponse.success(
      { area, services },
      'Area and Services fetched successfully',
    );
  }

  // find all area and services
  // find one area and services
  // update area and services
  // remove area and services
}
