import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {

  @ApiProperty({
    example: '31486502-8f52-44a0-8499-46ef1679151a',
    description: 'service provider id of the service provider being reviewed',
  })
  @IsString()
  toReviewId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'service id of the service being reviewed',
  })
  @IsString()
  serviceId: string;

  @ApiProperty({
    example: 5,
    description: 'Rating given to the service provider',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Great service!',
    description: 'Comment about the service',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
