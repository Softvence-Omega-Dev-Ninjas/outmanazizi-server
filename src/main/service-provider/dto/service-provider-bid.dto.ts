import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ServiceProviderBidDto {
  @ApiProperty({
    example: '5000',
  })
  @IsNotEmpty()
  price: string;

  @ApiProperty({
    example: 'I will complete the task within 3 days.',
  })
  @IsNotEmpty()
  serviceProviderProposal?: string;
}
