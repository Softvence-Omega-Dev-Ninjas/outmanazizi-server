import { BadRequestException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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

      // const serviceExists = await this.prisma.services.findFirst({
      //   where: { id: createJobDto.title },
      //   include: { subServices: true },
      // });
      // if (!serviceExists) {
      //   this.logger.warn(`Service not found: ${createJobDto.title}`);
      //   throw new NotFoundException('Service does not exist');
      // }
      // const subServiceExists = serviceExists?.subServices.find(
      //   (sub) => sub.id === createJobDto.subServices,
      // );
      // if (!subServiceExists) {
      //   this.logger.warn(`Sub-service not found: ${createJobDto.subServices} under service: ${createJobDto.title}`);
      //   throw new NotFoundException('Sub-service does not exist under the specified service');
      // }

      const categoriesExists = await this.prisma.category.findMany({
        where: { category: createJobDto.title as any },
      });
      if (categoriesExists.length === 0) {
        this.logger.warn(`Service categories not found: ${createJobDto.title}`);
        throw new NotFoundException('Service categories do not exist');
      }

      this.logger.debug(`Categories exist: ${JSON.stringify(categoriesExists)}`);

      const savedJob = await this.prisma.service.create({
        data: {
          userId,
          ...rest,
          file: images,
          serviceName: createJobDto.serviceName,
        },
      });

      this.logger.log(`Job created successfully: ${JSON.stringify(savedJob)}`);
      return ApiResponse.success(savedJob, 'Job created successfully');
    } catch (error) {
      this.logger.error('Job creation failed', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Job creation failed');
    }
  }

  // specific user jobs
  async userJobs(userId: string) {
    const result = await this.prisma.service.findMany({
      where: { userId },
      include: {
        bids: {
          include: {
            serviceProvider: {
              select: {
                myCurrentRating: true,
                ratingGetFromUsers: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    picture: true,
                  }
                }
              }
            }
          }
        }
      },

    });
    return ApiResponse.success(result, 'User jobs retrieved successfully');
  }

  // find all job
  async findAll() {
    try {
      const result = await this.prisma.service.findMany({
        include: { bids: true },
      });
      return ApiResponse.success(result, 'Jobs retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error retrieving jobs: ${message}`);
      throw new BadRequestException('Failed to retrieve jobs');
    }
  }

  // find one job in details
  async findOne(id: string) {
    try {
      const result = await this.prisma.service.findUnique({ where: { id } });
      return ApiResponse.success(result, 'Job retrieved successfully');
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error retrieving job ${id}: ${message}`);
      throw new BadRequestException('Failed to retrieve job');
    }
  }

  // update a job
  async update(id: string, updateJobDto: UpdateJobDto) {
    this.logger.log(`Update job request received for job: ${id}`);
    this.logger.debug(`Payload: ${JSON.stringify(updateJobDto)}`);
    const existingJob = await this.prisma.service.findUnique({ where: { id } });
    if (!existingJob) {
      this.logger.warn(`Job not found: ${id}`);
      throw new NotFoundException('Job does not exist');
    }
    const existingArea = await this.prisma.area.findUnique({ where: { id: updateJobDto.location } })
    if (!existingArea) {
      this.logger.warn(`Area not found: ${updateJobDto.location}`);
      throw new NotFoundException('Area does not exist');
    }
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
      this.logger.error(`Error updating job ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Update failed');
    }
  }

  // Send Delete Request to admin
  async remove(id: string) {
    this.logger.log(`Delete job request received for job: ${id}`);
    try {
      const deletedJob = await this.prisma.service.update({
        where: { id },
        data: { isDeleteRequestToAdmin: true },
      });
      this.logger.log(`Job removal requested to admin successfully for job: ${id}`);
      return ApiResponse.success(deletedJob, 'Job removal requested to admin successfully');
    } catch (error) {
      this.logger.error(`Error requesting job deletion for job ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Delete request failed');
    }
  }


  async locationJobs(userId: string,) {
    this.logger.log(`Fetching location-based jobs for service provider: ${userId}`);
    try {
      const serviceProviderExists = await this.prisma.serviceProvider.findUnique({
        where: { userId },
      });

      if (!serviceProviderExists) {
        this.logger.warn(`Service provider not found: ${userId}`);
        throw new NotFoundException('Service provider does not exist');
      }

      this.logger.debug(`Service provider details: ${JSON.stringify(serviceProviderExists)}`);
      const areaExists = await this.prisma.area.findMany({
        where: { id: { in: serviceProviderExists.serviceArea } },
      });

      if (areaExists.length === 0) {
        this.logger.warn(`No service areas found for service provider: ${userId}`);
        throw new NotFoundException('No service areas found for the service provider');
      }

      const relatedServices = await this.prisma.service.findMany({
        where: {
          location: {
            in: areaExists.map(area => area.id)
          }
        },
      });
      return ApiResponse.success(relatedServices, 'Location-based jobs retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      this.logger.error(`Error retrieving service provider location jobs: ${message}`);
      throw new BadRequestException('Failed to retrieve location-based jobs');
    }
  }


  async subcategoryJobs(subCategoryId: string, userId: string) {
    this.logger.log(
      `Fetching jobs for subcategory ${subCategoryId} and service provider ${userId}`,
    );

    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        this.logger.warn(`User not found: ${userId}`);
        throw new NotFoundException('User does not exist');
      }


      const serviceProvider = await this.prisma.serviceProvider.findUnique({
        where: { userId },
      });

      if (!serviceProvider) {
        this.logger.warn(`Service provider not found: ${userId}`);
        throw new NotFoundException('Service provider does not exist');
      }


      const subCategoryExists = await this.prisma.subServices.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategoryExists) {
        this.logger.warn(`Subcategory not found: ${subCategoryId}`);
        throw new NotFoundException('Subcategory does not exist');
      }


      const areas = await this.prisma.area.findMany({
        where: {
          id: {
            in: serviceProvider.serviceArea,
          },
        },
      });

      if (!areas.length) {
        throw new NotFoundException(
          'No service areas found for the service provider',
        );
      }


      const categories = await this.prisma.services.findMany({
        where: {
          id: {
            in: serviceProvider.serviceCategories,
          },
        },
      });
      if (!categories.length) {
        throw new NotFoundException(
          'No service categories found for the service provider',
        );
      }


      const jobs = await this.prisma.service.findMany({
        where: {
          subServices: subCategoryId,
          location: {
            in: areas.map((area) => area.id),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return ApiResponse.success(
        jobs,
        'Jobs retrieved successfully for the subcategory',
      );
    } catch (error) {
      this.logger.error(
        `Error retrieving jobs for subcategory ${subCategoryId}: ${error instanceof Error ? error.message : 'Unknown error'
        }`,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to retrieve jobs for subcategory',
      );
    }
  }

}

