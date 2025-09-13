import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { CreateServiceProviderDto } from './dto/create-service-provider.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { ServiceProviderBidDto } from './dto/service-provider-bid.dto';

@Controller('service-provider')
export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService,
  ) {}

  @Post('create-service-provider')
  @UseGuards(AuthenticationGuard)
  async create(
    @Body() createServiceProviderDto: CreateServiceProviderDto,
    @Req() req: Request,
  ) {
    return await this.serviceProviderService.create(
      req['userid'],
      createServiceProviderDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all service providers' })
  async findAll() {
    return await this.serviceProviderService.findAll();
  }

  @Post('makes-bid/:id')
  @UseGuards(AuthenticationGuard)
  async makeBid(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: ServiceProviderBidDto,
  ) {
    return await this.serviceProviderService.makeBid(req['userid'], id, body);
  }

  @Get('my-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Get my bids' })
  @UseGuards(AuthenticationGuard)
  async myBids(@Req() req: Request) {
    return await this.serviceProviderService.myBids(req['userid']);
  }

  @Patch('work-coplete/:serviceId')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Work Complete from service provider..' })
  async updateBid(@Param('serviceId') serviceId: string, @Req() req: Request) {
    return await this.serviceProviderService.workComplete(
      req['userid'],
      serviceId,
    );
  }
  @Get('my-all-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Get my all bids' })
  @UseGuards(AuthenticationGuard)
  async myAllBids(@Req() req: Request) {
    return await this.serviceProviderService.myAllBids(req['userid']);
  }
  @Get('my-completed-bids')
  @UseGuards(AuthenticationGuard)
  @ApiOperation({
    summary:
      'Get my completed bids also complete from service provider and consumer ',
  })
  @UseGuards(AuthenticationGuard)
  async myCompletedBids(@Req() req: Request) {
    return await this.serviceProviderService.myAcceptedBids(req['userid']);
  }
}
