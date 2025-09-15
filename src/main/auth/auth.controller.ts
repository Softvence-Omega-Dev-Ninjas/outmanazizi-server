import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto } from './dto';
import { Public } from 'src/guards/public.decorator';
import { GoogleUser } from './strategy/goggle.strategy';
import type { Request } from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { PasswordResetDto, ResetPasswordEmailDto } from './dto/resetPassword';
import { EmailAndOtpDto } from './dto/emailAndOtp.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  // @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  // otp verification and create user
  @Post('verify-otp')
  @Public()
  @ApiBody({ type: EmailAndOtpDto })
  async verifyOtp(@Body() emailAndOtpDto: EmailAndOtpDto) {
    return await this.authService.verifyOtp(
      emailAndOtpDto.email,
      emailAndOtpDto.otp,
    );
  }
  @Post('login')
  @Public()
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @Get('google')
  // @Public()
  // @UseGuards(AuthGuard('google'))
  // googleAuth() {
  //   console.log('Google Auth');
  // }

  // @Get('google/redirect')
  // @UseGuards(AuthGuard('google'))
  // @Public()
  // googleRedirect(@Req() req: Request) {
  //   return this.authService.saveGoogleUser(req.user as GoogleUser);
  // }

  // // ---- Facebook Login ----
  // @Get('facebook')
  // @Public()
  // @UseGuards(AuthGuard('facebook'))
  // async facebookLogin() {}

  // @Get('facebook/redirect')
  // @UseGuards(AuthGuard('facebook'))
  // @Public()
  // facebookRedirect(@Req() req: Request) {
  //   return this.authService.saveFacebookUser(req.user);
  // }

  // reset password send otp to user
  @Post('reset-password')
  @Public()
  @ApiBody({ type: ResetPasswordEmailDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordEmailDto) {
    return this.authService.forgotPassword(resetPasswordDto.email);
  }

  // reset password verify otp
  @Post('reset-password/verify-otp')
  @Public()
  @ApiBody({ type: EmailAndOtpDto })
  async verifyResetPassword(@Body() EmailAndOtpDto: EmailAndOtpDto) {
    return this.authService.verifyOtpForResetPassword(EmailAndOtpDto);
  }

  // reset password set new password
  @Post('reset-password/set-new-password')
  @Public()
  @ApiBody({ type: PasswordResetDto })
  async setNewPassword(@Body() passwordResetDto: PasswordResetDto) {
    return this.authService.resetPassword(
      passwordResetDto.email,
      passwordResetDto.password,
    );
  }
  // Change password
  @Post('change-password')
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req: Request,
  ) {
    return this.authService.changePassword(
      req['email'] as string,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
  // user update
  @Patch('update-user')
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: UpdateUserDto })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    return await this.authService.updateUser(
      req['userid'] as string,
      updateUserDto,
    );
  }

  // get resend otp
  @Get('resend-otp')
  @Public()
  @ApiBody({ type: String })
  async resendOtp(@Body('email') email: string) {
    return await this.authService.resendOtp(email);
  }
}
