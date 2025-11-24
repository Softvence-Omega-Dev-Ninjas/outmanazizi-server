import { Module } from '@nestjs/common';
import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderController } from './service-provider.controller';
import { JwtModule } from '@nestjs/jwt';
import { HelperModule } from 'src/utils/helper/helper.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [JwtModule, HelperModule, FirebaseModule],
  controllers: [ServiceProviderController],
  providers: [ServiceProviderService],
  exports: [ServiceProviderService],
})
export class ServiceProviderModule { }
