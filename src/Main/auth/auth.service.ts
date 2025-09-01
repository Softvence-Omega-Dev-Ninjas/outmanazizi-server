import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, AuthResponseDto, UserResponseDto } from './dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.formatUserResponse(user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.formatUserResponse(user),
    };
  }

  async validateUser(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return this.formatUserResponse(user);
  }

  private formatUserResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
