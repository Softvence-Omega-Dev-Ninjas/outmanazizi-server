import { ApiProperty, } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, } from 'class-validator';

export class UpdateDisputeDto {

  @ApiProperty({
    description: 'Details of the dispute',
    example: 'The product was not delivered as promised.',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  details?: string;

  @ApiProperty({
    description: 'Provide your images (not required)',
    type: 'array',
    items: { type: 'file', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
