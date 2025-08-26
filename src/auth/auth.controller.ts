import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // @Post('login')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Login user' })
  // @ApiBody({ type: LoginDto })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   description: 'User successfully logged in',
  //   type: AuthResponseDto,
  // })
  // @ApiResponse({
  //   status: HttpStatus.UNAUTHORIZED,
  //   description: 'Invalid credentials',
  // })
  // async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  //   return this.authService.login(loginDto);
  // }
}
