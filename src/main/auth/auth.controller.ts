import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import { ApiTags, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';
import { Public } from 'src/guards/public.decorator';
import type { Request } from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { PasswordResetDto, ResetPasswordEmailDto } from './dto/resetPassword';
import { EmailAndOtpDto, ResendOtpDto } from './dto/emailAndOtp.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/utils/common/file/fileUploads';
import { UploadImageDto } from './dto/uploadImage.dto';

@ApiTags('Authentication & User Management')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @Public()
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // otp verification and create user
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP and activate account' })
  @Public()
  @ApiBody({ type: EmailAndOtpDto })
  async verifyOtp(@Body() emailAndOtpDto: EmailAndOtpDto) {
    return await this.authService.verifyOtp(emailAndOtpDto.email, emailAndOtpDto.otp);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @Public()
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // reset password send otp to user
  @Post('upload-profile-picture')
  @ApiOperation({ summary: 'Upload profile picture' })
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: UploadImageDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10, { storage: storageConfig() }))
  async uploadProfilePicture(@UploadedFiles() images: Express.Multer.File[], @Req() req: Request) {
    if (!images || images.length === 0) {
      throw new BadRequestException('At least one image is required');
    }
    const image = images.map((f) => `${process.env.DOMAIN}/uploads/${f.filename}`);

    return await this.authService.uploadProfilePicture(req['userid'] as string, image);
  }
  @Post('reset-password')
  @ApiOperation({ summary: 'Initiate password reset by sending OTP' })
  @Public()
  @ApiBody({ type: ResetPasswordEmailDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordEmailDto) {
    return this.authService.forgotPassword(resetPasswordDto.email);
  }

  // reset password verify otp
  @Post('reset-password/verify-otp')
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  @Public()
  @ApiBody({ type: EmailAndOtpDto })
  async verifyResetPassword(@Body() EmailAndOtpDto: EmailAndOtpDto) {
    return this.authService.verifyOtpForResetPassword(EmailAndOtpDto);
  }

  // reset password set new password
  @Post('reset-password/set-new-password')
  @ApiOperation({ summary: 'Set new password after OTP verification' })
  @Public()
  @ApiBody({ type: PasswordResetDto })
  async setNewPassword(@Body() passwordResetDto: PasswordResetDto) {
    return this.authService.resetPassword(passwordResetDto.email, passwordResetDto.password);
  }
  // Change password
  @Post('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {
    return this.authService.changePassword(
      req['email'] as string,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
  // user update
  @Patch('update-user')
  @ApiOperation({ summary: 'Update user profile' })
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return await this.authService.updateUser(req['userid'] as string, updateUserDto);
  }

  // get resend otp
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP to email' })
  @Public()
  @ApiBody({ type: ResendOtpDto })
  async resendOtp(@Body() body: ResendOtpDto) {
    console.log(body.email);
    return await this.authService.resendOtp(body.email);
  }
}
