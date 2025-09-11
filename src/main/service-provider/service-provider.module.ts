import { Module } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { JwtModule } from '@nestjs/jwt';
import { HelperModule } from 'src/utils/helper/helper.module';

@Module({
  imports: [JwtModule, HelperModule],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
})
export class ServiceProviderModule {}
