import {
  Injectable,
  NotFoundException,
  UnauthorizedException,

} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Create the user
      const user = await this.prisma.user.upsert({
        where: { email: registerDto.email },
        update: {
          name: registerDto.name,
          phone: registerDto.phone,
          password: hashedPassword,
        },
        create: {
          email: registerDto.email,
          name: registerDto.name,
          phone: registerDto.phone,
          password: hashedPassword,
        },
      });


      return ApiResponse.success(user, 'User registered successfully',)
    } catch (error) {
      console.error('Error registering user:', error);
      throw new UnauthorizedException('User registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const userExists = await this.helperService.userExistsByEmail(loginDto.email);

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      if (!userExists.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatch = await bcrypt.compare(
        loginDto.password,
        userExists.password,
      );

      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const payload = { sub: userExists.id, email: userExists.email, role: userExists.role };
      const token = await this.jwtService.signAsync(payload)
      return ApiResponse.success(token, 'User logged in successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return ApiResponse.error('Login failed', errorMessage);
    }
  }
}
