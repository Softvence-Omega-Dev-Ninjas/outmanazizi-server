import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({ description: 'The other user ID for one-to-one chat' })
  @IsString()
  otherUserId: string;
}
