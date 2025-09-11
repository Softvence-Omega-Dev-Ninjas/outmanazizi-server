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
    return await this.adminService.serviceProviderVerification(userid);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'All User Proper Details' })
  async findAll() {
    return await this.adminService.findAll();
  }

  @Patch('blocked/:userid')
  @Public()
  @ApiOperation({ summary: 'Blocked a User ' })
  async blockedUser(@Param('userid') userid: string) {
    return await this.adminService.blockedUser(userid);
  }

  @Patch('delete/:userid')
  @Public()
  @ApiOperation({ summary: 'Delete  a User ' })
  async deleteUser(@Param('userid') userid: string) {
    return await this.adminService.deleteUser(userid);
  }
}
