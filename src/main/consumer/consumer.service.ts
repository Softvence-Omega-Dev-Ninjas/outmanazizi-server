import { BadRequestException, Injectable } from '@nestjs/common';
import { AcceptBid } from './dto/create-consumer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendReviewDto } from './dto/sendReview.dto';

@Injectable()
export class ConsumerService {
  constructor(private readonly prisma: PrismaService) {}

  async acceptBid(
    userid: string,
    serviceId: string,
    createConsumerDto: AcceptBid,
  ) {
    // check if the user is the owner of the service request
    const validConsumer = await this.prisma.service.findFirst({
      where: { id: serviceId, userId: userid },
    });
    if (!validConsumer) {
      throw new BadRequestException('You are not the owner of this service');
    }
    const serviceRequest = await this.prisma.bid.findFirst({
      where: {
        AND: [
          { serviceId },
          { serviceProviderId: createConsumerDto.serviceProviderId },
        ],
      },
    });
    if (!serviceRequest) {
      throw new BadRequestException(
        'Service request not with this service provider id ',
      );
    }
    // check if the bid is already accepted
    if (serviceRequest.status === 'ACCEPTED') {
      throw new BadRequestException('Bid is already accepted');
    }
    // update the bid status to accepted
    const updatedBid = await this.prisma.bid.update({
      where: { id: serviceRequest.id },
      data: { status: 'ACCEPTED' },
    });
    const assingedServiceRequest = await this.prisma.service.update({
      where: { id: serviceId },
      data: { assignedServiceProviderId: createConsumerDto.serviceProviderId },
    });
    return {
      message: 'Bid accepted successfully',
      data: { updatedBid, assingedServiceRequest },
    };
  }

  async serviceComplete(userid: string, serviceId: string) {
    // check if the user is the owner of the service request
    const validConsumer = await this.prisma.service.findFirst({
      where: { id: serviceId, userId: userid },
    });
    if (!validConsumer) {
      throw new BadRequestException('You are not the owner of this service');
    }
    // check if the service is assigned to a service provider
    if (!validConsumer.assignedServiceProviderId) {
      throw new BadRequestException(
        'Service is not assigned to any service provider',
      );
    }
    // check if the service is already completed
    if (validConsumer.isCompleteFromConsumer === true) {
      throw new BadRequestException('Service is already completed');
    }
    // update the service status to completed
    const updatedService = await this.prisma.service.update({
      where: { id: serviceId },
      data: { isCompleteFromConsumer: true },
    });
    return { message: 'Service completed successfully', updatedService };
  }
  async giveReview(userid: string, serviceId: string, body: SendReviewDto) {
    try {
      console.log(body);
      // check if the user is the owner of the service request
      const validConsumer = await this.prisma.user.findFirst({
        where: { id: userid, role: 'CONSUMER' },
      });
      if (!validConsumer) {
        throw new BadRequestException('You are not a valid consumer');
      }
      // check if the service provider is valid
      const validServiceProvider = await this.prisma.serviceProvider.findFirst({
        where: { userId: serviceId },
      });
      if (!validServiceProvider) {
        throw new BadRequestException('Invalid service provider');
      }
      // if the user give the review to the service provider previous review then update the review

      const totalRating =
        (validServiceProvider.myCurrentRating ?? 0) + parseFloat(body.rating);
      const totalUsers = validServiceProvider.getFromUsers + 1;
      const averageRating = totalRating / totalUsers;

      const existingReview = await this.prisma.review.findUnique({
        where: {
          userId_serviceProviderId: {
            userId: userid,
            serviceProviderId: validServiceProvider.id,
          },
        },
      });

      if (existingReview) {
        throw new BadRequestException('You already reviewed this provider');
      }

      const savedReview = await this.prisma.review.create({
        data: {
          rating: body.rating,
          comment: body.comments,
          userId: userid,
          serviceProviderId: validServiceProvider.id,
        },
      });

      await this.prisma.serviceProvider.update({
        where: { id: validServiceProvider.id },
        data: {
          myCurrentRating: averageRating,
          getFromUsers: totalUsers,
        },
      });

      return { message: 'Review submitted successfully', review: savedReview };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
