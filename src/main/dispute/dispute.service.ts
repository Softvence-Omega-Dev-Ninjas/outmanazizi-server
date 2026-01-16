import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly eventEmitter: EventEmitter2,
    private readonly firebase: FirebaseService,
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
          serviceid: createDisputeDto.serviceid
        },
      });
      if (disputeExists) {
        this.logger.warn(` You have already raised a dispute for service ID ${createDisputeDto.serviceid} against user ID ${jobExists.assignedServiceProvider?.userId}`);
        throw new BadRequestException('You have already raised a dispute for this service against the specified user');
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
      this.logger.error('Failed to create dispute', error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create dispute');
    }
  }

  async findAll() {
    try {
      const disputes = await this.prisma.dispute.findMany();
      return ApiResponse.success(disputes, 'Disputes retrieved successfully');
    } catch (error) {
      this.logger.error('Failed to retrieve disputes', error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to retrieve disputes');
    }
  }

  async findDisputeByUser(userId: string) {
    try {
      const res = await this.prisma.dispute.findMany({
        where: { userId: userId },
      });
      return ApiResponse.success(res, 'User disputes retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve disputes for user ${userId}`, error instanceof Error ? error.stack : error);
      throw new InternalServerErrorException('Failed to retrieve user disputes');
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
      this.logger.error(`Failed to update dispute with ID ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update dispute');
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
      this.logger.error(`Failed to delete dispute with ID ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete dispute');
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
      // send push notifications to both dispute participants (if they have FCM tokens)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const participants = [disputeExists.userId, disputeExists.againstId].filter(Boolean) as string[];
      for (const participantId of participants) {
        try {
          const userTokenResult = await this.prisma.user.findUnique({
            where: { id: participantId },
            select: { fcmToken: true },
          });
          const fcmToken = userTokenResult?.fcmToken ?? null;
          if (fcmToken) {
            await this.firebase.sendPushNotification(
              [fcmToken],
              'Dispute Resolved',
              'A dispute you were involved in has been resolved.',
              { disputeId: disputeExists.id, serviceId: disputeExists.serviceid },
            );
          } else {
            this.logger.log(`No FCM tokens found for user ${participantId}, skipping push notification`);
          }
        } catch (err) {
          this.logger.error(`Failed to send push notification for user ${participantId}: ${err instanceof Error ? err.message : err}`);
        }
      }

      return ApiResponse.success(resolvedDispute, 'Dispute resolved successfully');
    } catch (error) {
      this.logger.error(`Failed to resolve dispute with ID ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to resolve dispute');
    }
  }


  // get specific dispute by id
  async findOne(id: string) {
    try {
      const dispute = await this.prisma.dispute.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              picture: true,
            }
          },
          against: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              picture: true,
            }
          }
        }
      });
      if (!dispute) {
        this.logger.warn(`Dispute with ID ${id} does not exist`);
        throw new NotFoundException('Dispute not found');
      }
      return ApiResponse.success(dispute, 'Dispute retrieved successfully');
    } catch (error) {
      this.logger.error(`Failed to retrieve dispute with ID ${id}`, error instanceof Error ? error.stack : error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve dispute');
    }
  }
}