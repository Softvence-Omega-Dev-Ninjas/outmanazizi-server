import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(private readonly prisma: PrismaService) { }
  // Create a job
  async create(userId: string, createJobDto: CreateJobDto) {
    this.logger.log(`Create job request received for user: ${userId}`);
    this.logger.debug(`Payload: ${JSON.stringify(createJobDto)}`);
    try {
      const { images, ...rest } = createJobDto;

      const areaExists = await this.prisma.area.findFirst({
        where: { id: createJobDto.location },
      });
      if (!areaExists) {
        this.logger.warn(`Area not found: ${createJobDto.location}`);
        throw new NotFoundException('Area does not exist');
      }
      const serviceExists = await this.prisma.services.findFirst({
        where: { id: createJobDto.title },
        include: { subServices: true },
      });
      if (!serviceExists) {
        this.logger.warn(`Service not found: ${createJobDto.title}`);
        throw new NotFoundException('Service does not exist');
      }
      const subServiceExists = serviceExists?.subServices.find(
        (sub) => sub.id === createJobDto.subServices,
      );
      if (!subServiceExists) {
        this.logger.warn(`Sub-service not found: ${createJobDto.subServices} under service: ${createJobDto.title}`);
        throw new NotFoundException('Sub-service does not exist under the specified service');
      }

      const savedJob = await this.prisma.service.create({
        data: {
          userId,
          ...rest,
          file: images,
        },
      });
      this.logger.log(`Job created successfully: ${JSON.stringify(savedJob)}`);
      return ApiResponse.success(savedJob, 'Job created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Job creation failed: ${message}`);
      throw new BadRequestException(message);
    }
  }

  // find all job
  async findAll() {
    const result = await this.prisma.service.findMany({
      include: { bids: true },
    });
    return ApiResponse.success(result, 'Jobs retrieved successfully');
  }

  // find one job in details
  async findOne(id: string) {
    const result = await this.prisma.service.findUnique({ where: { id } });
    return ApiResponse.success(result, 'Job retrieved successfully');
  }

  // update a job
  async update(id: string, updateJobDto: UpdateJobDto) {
    try {
      const { file, ...rest } = updateJobDto;
      const updatedJob = await this.prisma.service.update({
        where: { id },
        data: {
          ...rest,
          file: file ? (Array.isArray(file) ? file : [file]) : undefined,
        },
      });
      return ApiResponse.success(updatedJob, 'Job updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException('Update failed ', message);
    }
  }

  // Send Delete Request to admin
  async remove(id: string) {
    try {
      const deletedJob = await this.prisma.service.update({
        where: { id },
        data: { isDeleteRequestToAdmin: true },
      });
      return ApiResponse.success(deletedJob, 'Job removal requested to admin successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new BadRequestException('Delete request failed', message);
    }
  }
}
