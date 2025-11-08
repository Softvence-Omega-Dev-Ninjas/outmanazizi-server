import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import ms from 'ms';

@Injectable()
export class HelperService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async userExistsByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async userExistsByUserid(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validServiceProvider(userId: string) {
    return await this.prismaService.serviceProvider.findUnique({
      where: { userId },
    });
  }

  async createTokenEntry(userId: string, payload: any) {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const expiresIn = this.configService.getOrThrow<string>('JWT_EXPIRES_IN') || '7d';

    if (!secret && !expiresIn) {
      throw new UnauthorizedException('JWT secret or expiration not found');
    }
    const token = await this.jwtService.signAsync(payload, {
      secret,
      expiresIn: expiresIn as ms.StringValue,
    });
    return token;
  }
}
