import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAreaDto, CreateServicesDto } from '../dto/areaAndServices.dto';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { CreateSubServicesDto } from '../dto/createSubServices.dto';
import { UpdateLocationDto } from '../dto/update.location.dto';

@Injectable()
export class AreaAndservicesService {
  private readonly logger = new Logger(AreaAndservicesService.name);
  constructor(private readonly prisma: PrismaService) { }
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
  async deleteSubService(subServiceId: string) {
    this.logger.log(`Deleting sub-service with ID: ${subServiceId}`);
    try {
      const subServiceExists = await this.prisma.subServices.findUnique({
        where: { id: subServiceId },
      });
      if (!subServiceExists) {
        throw new UnauthorizedException('Sub-service does not exists');
      }
      const deletedSubService = await this.prisma.subServices.delete({
        where: { id: subServiceId },
      });
      return ApiResponse.success(deletedSubService, 'Sub-service deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }
  // update sub service
  async updateSubService(subServiceId: string, dto: CreateSubServicesDto) {
    this.logger.log(`Updating sub-service with ID: ${subServiceId}`);
    try {
      const subServiceExists = await this.prisma.subServices.findUnique({
        where: { id: subServiceId },
      });
      if (!subServiceExists) {
        throw new UnauthorizedException('Sub-service does not exists');
      }
      const updatedSubService = await this.prisma.subServices.update({
        where: { id: subServiceId },
        data: {
          ...dto,
        },
      });
      return ApiResponse.success(updatedSubService, 'Sub-service updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }
  // update location
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

  // update service 
  async updateService(serviceId: string, dto: CreateServicesDto) {
    this.logger.log(`Updating service with ID: ${serviceId}`);
    try {
      const serviceExists = await this.prisma.services.findUnique({
        where: { id: serviceId },
      });
      if (!serviceExists) {
        throw new UnauthorizedException('Service does not exists');
      }
      const updatedService = await this.prisma.services.update({
        where: { id: serviceId },
        data: {
          name: dto.services,
        },
      });
      return ApiResponse.success(updatedService, 'Service updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new UnauthorizedException(message);
    }
  }

}
