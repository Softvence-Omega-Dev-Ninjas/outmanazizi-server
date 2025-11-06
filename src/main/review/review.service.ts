import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createReviewDto: CreateReviewDto, userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new BadRequestException('Invalid user ID');
      }
      const serviceProviderExists = await this.prisma.serviceProvider.findUnique({
        where: {
          id: createReviewDto.serviceProviderId,
        },
      });
      if (!serviceProviderExists) {
        throw new BadRequestException('Invalid service provider ID');
      }

      const existingReviews = await this.prisma.review.findMany({
        where: { serviceProviderId: createReviewDto.serviceProviderId },
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
          userId: userId,
          serviceProviderId: createReviewDto.serviceProviderId,
          serviceId: createReviewDto.serviceId,
        },
      });
      await this.prisma.serviceProvider.update({
        where: { id: serviceProviderExists.id },
        data: {
          myCurrentRating: rating,
          ratingGetFromUsers: numberOfReviews + 1,
        },
      });
      return ApiResponse.success(review, 'Review created successfully');
    } catch (error) {
      return ApiResponse.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }

  findAll() {
    return this.prisma.review.findMany();
  }
}
