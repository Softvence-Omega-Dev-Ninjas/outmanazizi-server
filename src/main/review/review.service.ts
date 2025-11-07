import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);
  constructor(private readonly prisma: PrismaService,
    private readonly helpersService: HelperService
  ) { }
  async create(createReviewDto: CreateReviewDto, userId: string) {
    this.logger.log(`Create review request received from user: ${userId}`);
    this.logger.debug(`Payload: ${JSON.stringify(createReviewDto)}`);
    try {
      const fromReviewId = await this.helpersService.userExistsByUserid(userId);
      const toReviewId = await this.helpersService.userExistsByUserid(createReviewDto.toReviewId);
      if (!toReviewId || !fromReviewId) {
        throw new BadRequestException('Invalid user IDs provided');
      }
      const existingReviews = await this.prisma.review.findMany({
        where: { fromReviewId: userId },
      });
      const numberOfReviews = existingReviews.length;
      const totalRating =
        existingReviews.reduce((acc, review) => acc + Number(review.rating), 0) +
        Number(createReviewDto.rating);

      const rating = totalRating / (numberOfReviews + 1);

      const review = await this.prisma.review.create({
        data: {
          rating: Number(createReviewDto.rating),
          comment: createReviewDto.comment,
          fromReviewId: userId,
          toReviewId: createReviewDto.toReviewId,
          serviceId: createReviewDto.serviceId,
        },
      });
      // await this.prisma.serviceProvider.update({
      //   where: { fromReviewId: serviceProviderExists.id },
      //   data: {
      //     myCurrentRating: rating,
      //     ratingGetFromUsers: numberOfReviews + 1,
      //   },
      // });
      if (toReviewId.role === 'SERVICE_PROVIDER') {
        const serviceProviderExists = await this.prisma.serviceProvider.findFirst({
          where: { userId: createReviewDto.toReviewId },
        });
        if (serviceProviderExists) {
          await this.prisma.serviceProvider.update({
            where: { id: serviceProviderExists.id },
            data: {
              myCurrentRating: rating,
              ratingGetFromUsers: numberOfReviews + 1,
            },
          });
        }
      }
      this.logger.log(`Review created successfully: ${JSON.stringify(review)}`);
      return ApiResponse.success(review, 'Review created successfully');
    } catch (error) {
      this.logger.error(`Error creating review: ${error instanceof Error ? error.message : 'An error occurred'}`);
      return ApiResponse.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  async findAll(userId: string) {

    this.logger.log(`Fetch all reviews request received from user: ${userId}`);
    try {
      const reviews = await this.prisma.review.findMany({
        where: { toReviewId: userId },
        include: {
          toReview: true,
        }
      });
      return ApiResponse.success(reviews, 'Reviews retrieved successfully');
    } catch (error) {
      this.logger.error(`Error retrieving reviews: ${error instanceof Error ? error.message : 'An error occurred'}`);
      return ApiResponse.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }
}
