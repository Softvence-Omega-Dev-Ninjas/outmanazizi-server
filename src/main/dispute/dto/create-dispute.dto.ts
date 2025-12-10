import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDisputeDto {
  @ApiProperty({
    description: 'The ID of the bid associated with the dispute',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  serviceid: string;


  @ApiProperty({
    description: 'Details of the dispute',
    example: 'The product was not delivered as promised.',
  })
  @IsNotEmpty()
  @IsString()
  details: string;

  @ApiProperty({
    description: 'Provide your images (not required)',
    type: 'array',
    items: { type: 'file', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
