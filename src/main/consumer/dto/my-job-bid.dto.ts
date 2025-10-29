import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MyJobBidDto {
  @ApiProperty({
    description: 'Service ID',
  })
  @IsUUID()
  serviceId: string;
}
