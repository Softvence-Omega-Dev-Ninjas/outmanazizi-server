import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaDto, CreateServicesDto } from '../dto/areaAndServices.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { CreateSubServicesDto } from '../dto/createSubServices.dto';

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
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(message);
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
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(message);
    }
  }

  async createSubServices(body: CreateSubServicesDto) {
    const { serviceId, name } = body;
    try {
      const service = await this.prisma.services.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new BadRequestException('Service not found');
      }
      const subServices = await this.prisma.subServices.create({
        data: {
          serviceId,
          name,
        },
      });
      return ApiResponse.success(subServices, 'Sub-service created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(message);
    }
  }

  async findAllAreaAndService() {
    const area = await this.prisma.area.findMany();
    const services = await this.prisma.services.findMany({
      include: { subServices: true },
    });
    return ApiResponse.success({ area, services }, 'Area and Services fetched successfully');
  }
}
