import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
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
}
