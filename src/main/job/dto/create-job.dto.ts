import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJobDto {

  @ApiProperty({
    description: 'Service name for the job',
    example: 'Plumbing in Gardern City',
  })
  @IsNotEmpty()
  @IsString()
  serviceName: string;
  @ApiProperty({
    description: 'Title of the job',
    example: 'e8c510cf-fe09-4d17-bafb-f8994820a4cd',
  })
  @IsString()
  title: string;
  @ApiProperty({
    description: 'Sub-category of the job',
    example: '66e7e8b0-9b51-430d-8f1d-2b930fb88648',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  subServices: string;

  @ApiProperty({
    description: 'Detailed description of the job',
    example: 'Need a professional painter to paint a 3-room apartment.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Job location',
    example: 'dd0341e8-7587-44ca-b292-915a83560dca',
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
