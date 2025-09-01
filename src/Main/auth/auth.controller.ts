import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/guards/public.decorator';
import { GoogleUser } from './strategy/goggle.strategy';
import type { Request } from 'express';



@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService

  ) { }

  @Post('register')
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
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




}
