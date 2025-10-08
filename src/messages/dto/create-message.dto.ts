import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The ID of the user who will receive the message',
    example: 'user-uuid',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
