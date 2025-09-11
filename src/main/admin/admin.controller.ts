import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/guards/public.decorator';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Make Service Provider verified
  @Patch('verify-service-provider/:userid')
  @Public()
  @ApiOperation({ summary: 'Make Service Provider verified' })
  async create(@Param('userid') userid: string) {
    console.log(userid);
    return await this.adminService.serviceProviderVerification(userid);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }
}
