import { Controller, Get, Patch, Param, Delete, Body, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/guards/public.decorator';
import { AreaAndservicesService } from './area-andservices/area-andservices.service';
import { CreateAreaDto, CreateServicesDto } from './dto/areaAndServices.dto';
import { CreateSubServicesDto } from './dto/createSubServices.dto';
import { RolesGuard } from 'src/guards/role.guard';
import { UserRole } from '../auth/role.enum';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/guards/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard, AuthenticationGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly areaAndservicesService: AreaAndservicesService,
  ) { }

  // Make Service Provider verified
  @Patch('verify-service-provider/:userid')
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
  @ApiOperation({ summary: 'Blocked a User ' })
  async blockedUser(@Param('userid') userid: string) {
    return await this.adminService.blockedUser(userid);
  }

  @Patch('delete/:userid')
  @ApiOperation({ summary: 'Delete  a User ' })
  async deleteUser(@Param('userid') userid: string) {
    return await this.adminService.deleteUser(userid);
  }

  // Delete a service, which is created by service provider
  @Delete('service/:serviceid')
  @ApiOperation({
    summary: 'Delete a service, which is created by service provider',
  })
  async deleteService(@Param('serviceid') serviceid: string) {
    return await this.adminService.deleteService(serviceid);
  }

  // create area and services
  @Post('create-area')
  @ApiOperation({ summary: 'Create area  ' })
  async createAreaAndServices(@Body() body: CreateAreaDto) {
    return await this.areaAndservicesService.createArea(body);
  }

  @Post('create-service')
  @ApiOperation({ summary: 'Create service  ' })
  async createServices(@Body() body: CreateServicesDto) {
    return await this.areaAndservicesService.createServices(body);
  }
  // find all area and services
  @Get('all-area-and-services')
  @Public()
  @ApiOperation({ summary: 'Find all area and services  ' })
  async findAllAreaAndService() {
    return await this.areaAndservicesService.findAllAreaAndService();
  }
  // find all serviceProvider
  @Get('all-service-provider')
  @ApiOperation({ summary: 'Find all serviceProvider  ' })
  async findAllServiceProvider() {
    return await this.adminService.findAllServiceProvider();
  }
  // create sub services
  @Post('create-sub-service')
  @ApiOperation({ summary: 'Create sub services  ' })
  async createSubServices(@Body() body: CreateSubServicesDto) {
    return await this.areaAndservicesService.createSubServices(body);
  }
}
