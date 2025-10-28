import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}
  // Create a job
  async create(userId: string, createJobDto: CreateJobDto) {
    try {
      const { images, ...rest } = createJobDto;

      const areaExists = await this.prisma.area.findFirst({
        where: { id: createJobDto.location },
      });
      if (!areaExists) {
        throw new NotFoundException('Area does not exist');
      }
      const serviceExists = await this.prisma.services.findFirst({
        where: { id: createJobDto.title },
      });
      if (!serviceExists) {
        throw new NotFoundException('Service does not exist');
      }

      const savedJob = await this.prisma.service.create({
        data: {
          userId,
          ...rest,
          file: images,
        },
      });
      return ApiResponse.success(savedJob, 'Job created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
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
