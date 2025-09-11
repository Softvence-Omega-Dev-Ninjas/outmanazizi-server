import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateServiceProviderDto {
  @ApiProperty({
    example: 'Pdf Or Image ',
    description: ' Document of service provider',
  })
  @IsNotEmpty()
  documents: string;

  @ApiProperty({ example: 'adress ', description: 'This is  demo adress' })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: ['Tehran', 'Karaj'], description: 'service area' })
  @IsNotEmpty()
  serviceArea: string[];

  @ApiProperty({
    example: ['Plumber', 'Electrician'],
    description: 'service categories',
  })
  @IsNotEmpty()
  serviceCategories: string[];
}
