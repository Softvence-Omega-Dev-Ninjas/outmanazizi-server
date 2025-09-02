import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string, createJobDto: CreateJobDto) {
    try {
      const savedJob = await this.prisma.service.create({
        data: {
          userId,
          ...createJobDto,
        },
      });
      return ApiResponse.success(savedJob, 'Job created successfully');
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Error creating job');
    }
  }

  async findAll() {
    const result = ApiResponse.success(
      await this.prisma.service.findMany(),
      'Jobs retrieved successfully',
    );
    return result;
  }

  async findOne(id: string) {
    const result = await this.prisma.service.findUnique({ where: { id } });
    return ApiResponse.success(result, 'Job retrieved successfully');
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    try {
      const updatedJob = await this.prisma.service.update({
        where: { id },
        data: updateJobDto,
      });
      return ApiResponse.success(updatedJob, 'Job updated successfully');
    } catch (error) {
      throw new Error('Error updating job', error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.service.delete({ where: { id } });
      return ApiResponse.success(null, 'Job removed successfully');
    } catch (error) {
      console.error('Error removing job:', error);
      throw new Error('Error removing job');
    }
  }
}
