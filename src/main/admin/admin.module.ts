import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HelperModule } from 'src/utils/helper/helper.module';
import { AreaAndservicesService } from './area-andservices/area-andservices.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [HelperModule, JwtModule],
  controllers: [AdminController],
  providers: [AdminService, AreaAndservicesService],
})
export class AdminModule { }
