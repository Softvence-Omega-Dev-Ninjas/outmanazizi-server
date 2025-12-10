import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
    example: '4c8e29b0-6042-41db-b32a-ff594ab43e53',
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
  @Type(() => Boolean)
  toolsNeed?: boolean;

  @ApiProperty({
    description: 'Job images ',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  @IsOptional()
  @IsString({ each: true })
  file?: string[];
}
