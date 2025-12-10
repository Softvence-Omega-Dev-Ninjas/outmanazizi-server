import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AcceptBid {
  @ApiProperty({
    example: 'clg12345',
    description: 'Service ID against which the bid is accepted',
  })
  @IsNotEmpty()
  serviceProviderId: string;
}
