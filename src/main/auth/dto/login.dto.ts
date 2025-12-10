import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../role.enum';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'shantohmmm@gmail.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;


  @ApiProperty({
    description: 'User role',
    example: UserRole.CONSUMER,
    enum: UserRole,
  })
  @IsEnum(UserRole, { message: 'Role must be either USER or SERVICE_PROVIDER' })
  role: UserRole;

  @ApiProperty({
    description: 'Firebase Cloud Messaging token',
    example: 'fcmTokenExample123',
    required: false,
  })
  @IsString({ message: 'FCM token must be a string' })
  @IsOptional({ message: 'FCM token is required' })
  fcmToken: string;
}