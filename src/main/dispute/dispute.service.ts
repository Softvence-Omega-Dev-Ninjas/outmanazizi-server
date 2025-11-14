import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';

@Injectable()
export class DisputeService {
  logger = new Logger(DisputeService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService
  ) { }

  async create(createDisputeDto: CreateDisputeDto, userId: string, images: string[]) {
    this.logger.log(`Creating dispute for user ${userId} with bid ID ${createDisputeDto.bidId}`);

    try {
      const userExists = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!userExists) {
        this.logger.warn(`User with ID ${userId} does not exist`);
        throw new NotFoundException('UserId not found');
      }

      const againstDisputId = await this.helperService.userExistsByUserid(createDisputeDto.againstDisputId);

      if (!againstDisputId) {
        this.logger.warn(`Against user with ID ${createDisputeDto.againstDisputId} does not exist`);
        throw new NotFoundException('Against userId not found');
      }
      const bidExists = await this.prisma.bid.findUnique({
        where: { id: createDisputeDto.bidId },
      });
      if (!bidExists) {
        this.logger.warn(`Bid with ID ${createDisputeDto.bidId} does not exist`);
        throw new NotFoundException('Bid not found');
      }
      const disputeExists = await this.prisma.dispute.findFirst({
        where: {
          AND: [
            { bidId: createDisputeDto.bidId },
            { againstId: createDisputeDto.againstDisputId },
          ]

        },
      });
      if (disputeExists) {
        this.logger.warn(` You have already raised a dispute for bid ID ${createDisputeDto.bidId} against user ID ${createDisputeDto.againstDisputId}`);
        return ApiResponse.error(' You have already raised a dispute for this bid against the specified user');
      }
      const result = await this.prisma.dispute.create({
        data: {
          bidId: createDisputeDto.bidId,
          userId: userId,
          againstId: createDisputeDto.againstDisputId,
          details: createDisputeDto.details,
          pictures: images,
          isSolved: false,
        },
      });
      return ApiResponse.success(result, 'Dispute created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create dispute for user ${userId} with bid ID ${createDisputeDto.bidId}: ${message}`, message);
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

  update(id: number, updateDisputeDto: UpdateDisputeDto) {
    return `This action updates a #${id} dispute`;
  }

  remove(id: number) {
    return `This action removes a #${id} dispute`;
  }
}
