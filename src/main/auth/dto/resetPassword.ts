import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordEmailDto {
  @ApiProperty({
    type: String,
    example: 'shantohmmm@gmail.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class PasswordResetDto {
  @ApiProperty({
    type: String,
    example: 'shantohmmm@gmail.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    type: String,
    example: '123456',
  })
  @IsNotEmpty({ message: 'Please give me your new password' })
  password: string;
}
