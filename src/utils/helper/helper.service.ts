import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HelperService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
