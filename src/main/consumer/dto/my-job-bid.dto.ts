import { ApiProperty } from '@nestjs/swagger';

export class myJobBidDto {
  @ApiProperty({
    example: 'de3489e5-4e36-4e4e-af0f-9015da33fb3f',
    description: 'Service ID  ',
  })
  serviceId: string;
}
