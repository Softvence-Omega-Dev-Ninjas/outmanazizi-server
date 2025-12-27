import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateServiceProviderDto {
  @ApiProperty({ example: 'adress ', description: 'This is  demo adress' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    example: ['6eaaaf9c-1902-4aee-ab12-1e6561ab2c36'],
    description: 'service area',
  })
  @IsNotEmpty()
  serviceArea: string[];

  @ApiProperty({
    example: ['Plumbing', 'Electrical'],
    description: 'service categories',
  })
  @IsNotEmpty()
  serviceCategories: string[];
}
