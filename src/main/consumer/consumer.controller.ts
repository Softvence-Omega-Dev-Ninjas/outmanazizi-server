import { Controller, Post, Body, Patch, Param, Req, UseGuards, Get } from '@nestjs/common';

import { ConsumerService } from './consumer.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { AcceptBid } from './dto/create-consumer.dto';
import { MyJobBidDto } from './dto/my-job-bid.dto';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) { }

  @Post('bided-providers')
  @ApiOperation({ summary: 'Get all bided service providers for a service request' })
  async getBidedProviders(@Req() req: Request, @Body() dto: MyJobBidDto) {
    return await this.consumerService.getBidedProviders(req['userid'] as string, dto.serviceId);
  }

  // accept bid
  @Post('accept-bid/:serviceId')
  @ApiOperation({ summary: 'Accept a bid for a service request' })
  async acceptBid(
    @Param('serviceId') serviceId: string,
    @Body() acceptBidDto: AcceptBid,
    @Req() req: Request,
  ) {
    return await this.consumerService.acceptBid(req['userid'] as string, serviceId, acceptBidDto);
  }
  //remove bid
  @Patch('remove-bid/:serviceId/:serviceProviderId')
  @ApiOperation({ summary: 'Remove a bid for a service request' })
  async removeBid(
    @Param('serviceId') serviceId: string,
    @Param('serviceProviderId') serviceProviderId: string,
    @Req() req: Request,
  ) {
    return await this.consumerService.removeBid(req['userid'] as string, serviceId, serviceProviderId);
  }
  @Patch('service-complete/:serviceId')
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  async updateBid(@Param('serviceId') serviceId: string, @Req() req: Request) {
    return await this.consumerService.serviceComplete(req['userid'] as string, serviceId);
  }
  // my notifications
  @Get('my-notifications')
  @ApiOperation({ summary: 'Get my notifications' })
  @UseGuards(AuthenticationGuard)
  async myNotifications(@Req() req: Request) {
    return await this.consumerService.myNotifications(req['userid'] as string);
  }
  // get specific service provider info
  @Get('service-provider-info/:serviceProviderId')
  @ApiOperation({ summary: 'Get specific service provider info' })
  @UseGuards(AuthenticationGuard)
  async serviceProviderInfo(@Param('serviceProviderId') serviceProviderId: string) {
    return await this.consumerService.getServiceProviderInfo(serviceProviderId);
  }
}
