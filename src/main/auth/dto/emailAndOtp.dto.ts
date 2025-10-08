import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EmailAndOtpDto {
  @ApiProperty({
    example: 'shantohmmm@gmail.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'One Time Password (OTP) for verification',
  })
  @IsNotEmpty({ message: 'OTP is required' })
  otp: string;
}
export class ResendOtpDto {
  @ApiProperty({
    example: 'shantohmmm@gmail.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}
