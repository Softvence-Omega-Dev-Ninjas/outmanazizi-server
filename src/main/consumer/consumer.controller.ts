import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConsumerService } from './consumer.service';
import { AcceptBid } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/auth.guard';

@Controller('consumer')
export class ConsumerController {
  constructor(private readonly consumerService: ConsumerService) {}

  @Post('accept-bid/:serviceId')
  @ApiOperation({ summary: 'Accept a bid for a service request' })
  async acceptBid(
    @Param('serviceId') serviceId: string,
    @Body() acceptBidDto: AcceptBid,
    @Req() req: Request,
  ) {
    return await this.consumerService.acceptBid(
      req['userid'],
      serviceId,
      acceptBidDto,
    );
  }
  @Patch('service-complete/:serviceId')
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Work Complete from consumer..' })
  async updateBid(@Param('serviceId') serviceId: string, @Req() req: Request) {
    return await this.consumerService.serviceComplete(req['userid'], serviceId);
  }
}
