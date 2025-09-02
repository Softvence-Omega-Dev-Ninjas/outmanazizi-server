import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { LoginDto, RegisterDto, } from './dto';
import { Public } from 'src/guards/public.decorator';
import { GoogleUser } from './strategy/goggle.strategy';
import type { Request } from 'express';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticationGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { ResetPasswordDto, ResetPasswordEmailDto } from './dto/resetPassword';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService

  ) { }

  @Post('register')
  @Public()
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    console.log('Google Auth');
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @Public()
  googleRedirect(@Req() req: Request) {
    return this.authService.saveGoogleUser(req.user as GoogleUser);
  }


  // ---- Facebook Login ----
  @Get('facebook')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin() { }

  @Get('facebook/redirect')
  @UseGuards(AuthGuard('facebook'))
  @Public()
  facebookRedirect(@Req() req: Request) {
    return this.authService.saveFacebookUser(req.user);
  }

  // reset password send otp to user
  @Post('reset-password')
  @Public()
  @ApiBody({ type: ResetPasswordEmailDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordEmailDto) {
    return this.authService.forgotPassword(resetPasswordDto.email);
  }

  // reset password verify otp
  @Post('reset-password/verify')
  @Public()
  @ApiBody({ type: ResetPasswordDto })
  async verifyResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    console.log(resetPasswordDto);
    return this.authService.verifyResetPassword(resetPasswordDto);
  }

  // Change password
  @Post('change-password')
  @UseGuards(AuthenticationGuard)
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: Request) {

    return this.authService.changePassword(
      req['email'] as string,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }


}