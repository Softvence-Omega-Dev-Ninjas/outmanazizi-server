import { PartialType } from '@nestjs/swagger';
import { AcceptBid } from './create-consumer.dto';

export class UpdateConsumerDto extends PartialType(AcceptBid) {}
