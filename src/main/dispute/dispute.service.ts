import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async create(createDisputeDto: CreateDisputeDto, userId: string, images: string[]) {
    this.logger.log(`Creating dispute for user ${userId} with service ID ${createDisputeDto.serviceid}`);

    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        this.logger.warn(`User with ID ${userId} does not exist`);
        throw new NotFoundException('UserId not found');
      }


      const jobExists = await this.prisma.service.findUnique({
        where: { id: createDisputeDto.serviceid },
        include: {
          assignedServiceProvider: {
            select: { userId: true }
          }
        },
      });
      const againstId = jobExists?.assignedServiceProvider?.userId;
      if (!jobExists) {
        this.logger.warn(`Job with ID ${createDisputeDto.serviceid} does not exist`);
        throw new NotFoundException('Job not found');
      }
      const disputeExists = await this.prisma.dispute.findFirst({
        where: {
          AND: [
            { serviceid: createDisputeDto.serviceid },
            { againstId },
          ]
        },
      });
      if (disputeExists) {
        this.logger.warn(` You have already raised a dispute for service ID ${createDisputeDto.serviceid} against user ID ${jobExists.assignedServiceProvider?.userId}`);
        return ApiResponse.error(' You have already raised a dispute for this service against the specified user');
      }
      const result = await this.prisma.dispute.create({
        data: {
          serviceid: createDisputeDto.serviceid,
          userId: userId,
          againstId: againstId || '',
          details: createDisputeDto.details,
          pictures: images,
          isSolved: false,
        },
      });
      return ApiResponse.success(result, 'Dispute created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create dispute for user ${userId} with service ID ${createDisputeDto.serviceid}: ${message}`, message);
      return ApiResponse.error(message);
    }
  }

  async findAll() {
    try {
      return ApiResponse.success(await this.prisma.dispute.findMany(), 'Disputes retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to retrieve disputes: ${message}`, message);
      return ApiResponse.error(message);
    }
  }

  async findDisputeByUser(userId: string) {
    try {
      const res = await this.prisma.dispute.findMany({
        where: { userId: userId },
      });
      return ApiResponse.success(res, 'User disputes retrieved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to retrieve disputes for user ${userId}: ${message}`, message);
      return ApiResponse.error(message);
    }
  }

  async update(id: string, updateDisputeDto: UpdateDisputeDto, userId: string, images: string[]) {
    try {
      const userAndDisputeExists = await this.prisma.dispute.findFirst({
        where: {
          AND: [
            { id: id },
            { userId: userId },
          ]
        },
      })
      if (!userAndDisputeExists) {
        this.logger.warn(`Dispute with ID ${id} for user ${userId} does not exist`);
        throw new NotFoundException('Dispute not found for this user');
      }
      const disputeExists = await this.prisma.dispute.findUnique({
        where: { id: id },
      });
      if (!disputeExists) {
        this.logger.warn(`Dispute with ID ${id} does not exist`);
        throw new NotFoundException('Dispute not found');
      }
      const updatedDispute = await this.prisma.dispute.update({
        where: { id: id },
        data: {
          details: updateDisputeDto.details || disputeExists.details,
          pictures: images.length > 0 ? images : disputeExists.pictures,
        },
      });
      return ApiResponse.success(updatedDispute, 'Dispute updated successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update dispute with ID ${id}: ${message}`, message);
      return ApiResponse.error(message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      const disputeExistsByUser = await this.prisma.dispute.findFirst({
        where: {
          AND: [
            { id: id },
            { userId: userId },
          ]
        },
      });
      if (!disputeExistsByUser) {
        this.logger.warn(`Dispute with ID ${id} for user ${userId} does not exist`);
        throw new NotFoundException('Dispute not found for this user');
      }
      const res = await this.prisma.dispute.delete({
        where: { id: id },
      });
      return ApiResponse.success(res, 'Dispute deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete dispute with ID ${id}: ${message}`, message);
      return ApiResponse.error(message);
    }
  }
  // resolve a dispute (admin functionality)
  async resolveDispute(id: string, userid: string) {
    try {
      const disputeExists = await this.prisma.dispute.findUnique({
        where: { id: id },
      });
      if (disputeExists?.isSolved) {
        this.logger.warn(`Dispute with ID ${id} is already resolved`);
        // return ApiResponse.success(disputeExists, 'Dispute is already resolved');
      }
      if (!disputeExists) {
        this.logger.warn(`Dispute with ID ${id} does not exist`);
        throw new NotFoundException('Dispute not found');
      }
      const resolvedDispute = await this.prisma.dispute.update({
        where: { id: id },
        data: { isSolved: true },
      });
      console.log(disputeExists);
      this.logger.log(`Dispute with ID ${id} has been resolved`);
      this.eventEmitter.emit(
        'Notification',
        {
          toNotification: disputeExists.userId,
          fromNotification: userid,
          type: 'DISPUTE_RESOLVED',
          jobId: disputeExists.id,
        },
      );
      this.eventEmitter.emit(
        'Notification',
        {
          toNotification: disputeExists.againstId,
          fromNotification: userid,
          type: 'DISPUTE_RESOLVED',
          jobId: disputeExists.id,
        },
      );
      return ApiResponse.success(resolvedDispute, 'Dispute resolved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to resolve dispute with ID ${id}: ${message}`, message);
      return ApiResponse.error(message);
    }
  }
}
