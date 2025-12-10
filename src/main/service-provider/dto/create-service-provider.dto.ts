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
    example: ['5b20bdb2-7db2-425d-9943-a03e9abbe96a'],
    description: 'service categories',
  })
  @IsNotEmpty()
  serviceCategories: string[];
}
