import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: '31486502-8f52-44a0-8499-46ef1679151a',
    description: 'service provider id  of the service provider being reviewed',
  })
  @IsString()
  serviceProviderId: string;

  @ApiProperty({
    example: 5,
    description: 'Rating given to the service provider',
  })
  @IsString()
  rating: string;

  @ApiProperty({
    example: 'Great service!',
    description: 'Comment about the service',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
