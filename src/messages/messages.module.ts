import { Module } from '@nestjs/common';
import { WebsocketService } from './messages.service';
import { SmsGateway } from './messages.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [SmsGateway, WebsocketService],
})
export class WebsocketModule {}
