import { BadRequestException, Injectable } from '@nestjs/common';
import { AcceptBid } from './dto/create-consumer.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
