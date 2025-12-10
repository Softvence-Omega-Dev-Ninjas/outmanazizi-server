import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'The old password of the user' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: 'The new password of the user' })
  @IsNotEmpty()
  newPassword: string;
}

export class otpDto {
  @ApiProperty({ description: 'The otp of the user' })
  @IsNotEmpty()
  otp: string;
}
