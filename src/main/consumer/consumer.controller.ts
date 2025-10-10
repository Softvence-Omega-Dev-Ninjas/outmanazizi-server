import {
  Controller,

  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,



} from '@nestjs/common';


import { ConsumerService } from './consumer.service';
import { AcceptBid } from './dto/create-consumer.dto';
import { ApiOperation, } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/auth.guard';

import { SendReviewDto } from './dto/sendReview.dto';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) { }

  @Post('accept-bid/:serviceId')
  @ApiOperation({ summary: 'Accept a bid for a service request' })
  async acceptBid(
    @Param('serviceId') serviceId: string,
    @Body() acceptBidDto: AcceptBid,
    @Req() req: Request,
  ) {
    return await this.consumerService.acceptBid(
      req['userid'] as string,
      serviceId,
      acceptBidDto,
    );
  }
  @Patch('service-complete/:serviceId')
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  async updateBid(@Param('serviceId') serviceId: string, @Req() req: Request) {
    return await this.consumerService.serviceComplete(req['userid'] as string, serviceId);
  }

  @Post('give-review/:serviceId')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Give review to service provider' })
  async giveReview(
    @Param('serviceProviderId') serviceProviderId: string,
    @Req() req: Request,
    @Body() body: SendReviewDto,
  ) {
    return await this.consumerService.giveReview(
      req['userid'] as string,
      serviceProviderId,
      body,
    );
  }
}
