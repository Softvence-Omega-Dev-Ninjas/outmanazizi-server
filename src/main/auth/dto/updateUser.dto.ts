import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User phone number',
    example: '+112434223443',
  })
  @IsNotEmpty({ message: 'Phone is required' })
  phone?: string;

  @ApiProperty({
    description: 'Username',
    example: 'John',
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  name?: string;

  @ApiProperty({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  profile?: string;
}
