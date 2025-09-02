import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';
export class UpdateJobDto {
  @ApiProperty({
    description: 'Title of the job',
    example: 'House Painting Service',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Detailed description of the job',
    example: 'Need a professional painter to paint a 3-room apartment.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Job location',
    example: 'Dhaka, Bangladesh',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Job budget',
    example: '15000 BDT',
  })
  @IsString()
  @IsOptional()
  budget?: string;

  @ApiProperty({
    description: 'Starting time of the job',
    example: '2025-09-10T10:00:00Z',
  })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiProperty({
    description: 'Whether tools are needed or not',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  toolsNeed?: boolean;

  @ApiProperty({
    description: 'Optional file attachment',
    example: 'uploads/job-files/abc.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  file?: string;
}
