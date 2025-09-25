import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({
    description: 'Title of the job',
    example: '8d3cce0b-45f9-424f-b27c-bc5071133acb',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the job',
    example: 'Need a professional painter to paint a 3-room apartment.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Job location',
    example: '6eaaaf9c-1902-4aee-ab12-1e6561ab2c36',
  })
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Job budget',
    example: '15000 BDT',
  })
  @IsString()
  budget: string;

  @ApiProperty({
    description: 'Starting time of the job',
    example: '2025-09-10T10:00:00Z',
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'Ending time of the job',
    example: '2025-09-10T15:00:00Z',
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description: 'Whether tools are needed or not',
    example: true,
  })
  @IsBoolean()
  @Type(() => Boolean)
  toolsNeed: boolean;

  @ApiProperty({
    description: 'Job images (required)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
  })
  images: string[];
}
