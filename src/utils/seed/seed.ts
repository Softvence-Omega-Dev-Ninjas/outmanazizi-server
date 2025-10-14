import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export async function seedSuperAdmin(
  prismaService: PrismaService,
  configService: ConfigService,
) {
  console.log('Seeding super admin user...');
  const superAdminEmail = configService.get<string>('SUPER_ADMIN_EMAIL');
  const superAdminPassword = configService.get<string>('SUPER_ADMIN_PASSWORD');

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      'Super admin credentials are not set in environment variables',
    );
  }

  const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
  // const existingUser = await prismaService.user.upsert({
  //   where: { email: superAdminEmail },
  //   update: {},
  //   create: {
  //     email: superAdminEmail,
  //     role: 'SUPER_ADMIN',
  //     name: 'Super Admin',
  //     phone: '0000000000',
  //     picture: '',
  //     password: hashedPassword,
  //     isEmailVerified: true,
  //   },
  // });

  // if (existingUser && existingUser.email === superAdminEmail) {
  //   console.log('Super admin user already exists');
  // } else {
  //   console.log('Super admin user created');
  // }
} 
