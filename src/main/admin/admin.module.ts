import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HelperModule } from 'src/utils/helper/helper.module';
import { AreaAndservicesService } from './area-andservices/area-andservices.service';

@Module({
  imports: [HelperModule],
  controllers: [AdminController],
  providers: [AdminService, AreaAndservicesService],
})
export class AdminModule {}
