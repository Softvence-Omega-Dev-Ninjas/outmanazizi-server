import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SendReviewDto {
  @ApiProperty({
    example: '4.5',
  })
  @IsNotEmpty({ message: 'Rating is required' })
  rating: string;

  @ApiProperty({})
  @IsNotEmpty({ message: 'Comments is optional' })
  comments?: string;
}
