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
import { UpdateLocationDto } from './dto/update.location.dto';

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
  @Get('all-orders')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Find all orders  ' })
  async findAllOrders() {
    return await this.adminService.findAllOrders();
  }
  // change role of a user
  @Patch('change-role/:userid/:role')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Change role of a user  ' })
  async changeUserRole(
    @Param('userid') userid: string,
    @Param('role') role: UserRole,
  ) {
    return await this.adminService.changeUserRole(userid, role);
  }

  // update a location of a user
  @Patch('update-location/:locationId')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a location of a user  ' })
  async updateUserLocation(
    @Param('locationId') locationId: string,
    @Body() body: UpdateLocationDto,
  ) {
    return await this.areaAndservicesService.updateUserLocation(locationId, body);
  }
  // delete a location of a user
  @Delete('delete-location/:locationId')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a location of a user  ' })
  async deleteUserLocation(
    @Param('locationId') locationId: string,
  ) {
    return await this.areaAndservicesService.deleteUserLocation(locationId);
  }
  // delete sub-service
  @Delete('delete-sub-service/:subServiceId')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a sub-service  ' })
  async deleteSubService(
    @Param('subServiceId') subServiceId: string,
  ) {
    return await this.areaAndservicesService.deleteSubService(subServiceId);
  }
  // update service 
  @Patch('update-service/:serviceId')
  @UseGuards(RolesGuard, AuthenticationGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a service  ' })
  async updateService(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateServicesDto,
  ) {
    console.log(serviceId, body);
    return await this.areaAndservicesService.updateService(serviceId, body);
  }
  // area details 
  @Get('area-details/:areaId')
  @Public()
  @ApiOperation({ summary: 'Get area details by area ID' })
  async getAreaDetails(@Param('areaId') areaId: string) {
    return await this.areaAndservicesService.getAreaDetails(areaId);
  }
  // service details
  @Get('service-details/:serviceId')
  @Public()
  @ApiOperation({ summary: 'Get service details by service ID' })
  async getServiceDetails(@Param('serviceId') serviceId: string) {
    return await this.areaAndservicesService.getServiceDetails(serviceId);
  }
}
