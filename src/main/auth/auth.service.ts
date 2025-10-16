import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/utils/common/apiresponse/apiresponse';
import { HelperService } from 'src/utils/helper/helper.service';
import { getLocalDateTime } from 'src/utils/common/localtimeAndDate/localtime';
import { MailService } from 'src/utils/mail/mail.service';
import { UpdateUserDto } from './dto/updateUser.dto';
import { EmailAndOtpDto } from './dto/emailAndOtp.dto';
import { UserRole } from './role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
    private readonly mailService: MailService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      const userExists = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (userExists) {
        throw new BadRequestException(
          'You are already registered. Please log in.',
        );
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(
        registerDto.password,
        saltRounds,
      );

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = getLocalDateTime(10);
      if (registerDto.role === UserRole.CONSUMER) {
        const user = await this.prisma.user.create({
          data: {
            email: registerDto.email,
            name: registerDto.name,
            phone: registerDto.phone,
            password: hashedPassword,
            role: registerDto.role,
            otp,
            otpExpiresAt,
          },
        });
        const data = { ...user, otp }
        return ApiResponse.success(
          data,
          'User registered successfully. Please verify OTP sent to your email.',
        );
      }

      if (registerDto.role === UserRole.SERVICE_PROVIDER) {
        const user = await this.prisma.user.create({
          data: {
            email: registerDto.email,
            name: registerDto.name,
            phone: registerDto.phone,
            password: hashedPassword,
            role: registerDto.role,
            otp,
            otpExpiresAt,
          },
        });

        const serviceProvider = await this.prisma.serviceProvider.create({
          data: {
            userId: user.id,
            isProfileCompleted: false,
            address: '',
          }
        });
        const data = {
          ...serviceProvider, otp
        }
        return ApiResponse.success(
          data,
          'Service Provider registered successfully. Please verify OTP sent to your email.',
        );
      }

      // Send OTP email
      await this.mailService.sendMail(
        registerDto.email,
        'Account Verification OTP',
        `<p>Your OTP code is: <strong>${otp}</strong></p>`,
      );


    } catch (error: any) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      return ApiResponse.error('Registration failed', errorMessage);
    }
  }


  // verify otp and create user
  async verifyOtp(email: string, otp: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.otp !== otp) {
        throw new UnauthorizedException('Invalid OTP');
      }
      const currentTime = new Date(getLocalDateTime(0));
      if (currentTime > new Date(user.otpExpiresAt as string | number | Date)) {
        throw new UnauthorizedException('OTP expired');
      }
      const data = await this.prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiresAt: null, isEmailVerified: true },
      });
      return ApiResponse.success(
        data,
        'OTP verified successfully and user created',
      );
    } catch (error) {
      return ApiResponse.error('OTP verification failed', error.message);
    }
  }
  async uploadProfilePicture(userId: string, image: string[]) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { picture: image[0] },
      });
      return ApiResponse.success(updatedUser, 'Profile picture uploaded successfully');
    } catch (error) {
      return ApiResponse.error('Upload profile picture failed', error.message);
    }
  }
  async login(loginDto: LoginDto) {
    try {
      const userExists = await this.helperService.userExistsByEmail(
        loginDto.email,
      );
      if (!userExists?.isEmailVerified) {
        throw new BadRequestException('Please verify your email first');
      }

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
      const payload = {
        sub: userExists.id,
        email: userExists.email,
        role: userExists.role,
      };
      const serviceProvider = await this.prisma.serviceProvider.findFirst({
        where: { userId: userExists.id },
      });
      const token = await this.jwtService.signAsync(payload);
      if (userExists.role === UserRole.SERVICE_PROVIDER) {
        return ApiResponse.success(
          { token, serviceProvider },
          'Service provider logged in successfully',
        );
      }
      return ApiResponse.success(
        { token, userExists },
        'User logged in successfully',
      );
    } catch (error) {
      console.log(error);
      return ApiResponse.error('Login failed', error.message);
    }
  }

  // Google OAuth Save information
  async saveGoogleUser(user: any) {
    try {
      const { email, firstName, picture, provider } = user;

      const newUser = await this.prisma.user.upsert({
        where: { email },
        update: { name: firstName, picture, provider },
        create: { email, name: firstName, picture, provider, phone: '' },
      });
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        role: 'CONSUMER',
      };
      const token = await this.jwtService.signAsync(payload);
      return ApiResponse.success(token, 'User created successfully');
    } catch (error) {
      console.error('Error saving Google user:', error);
      throw new UnauthorizedException('Google user registration failed');
    }
  }

  // facebook OAuth Save information
  async saveFacebookUser(user: any) {
    try {
      const { email, firstName, picture, provider } = user;

      const newUser = await this.prisma.user.upsert({
        where: { email },
        update: { name: firstName, picture, provider },
        create: { email, name: firstName, picture, provider, phone: '' },
      });
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        role: 'CONSUMER',
      };
      const token = await this.jwtService.signAsync(payload);
      return ApiResponse.success(token, 'User created successfully');
    } catch (error) {
      console.error('Error saving Facebook user:', error);
      throw new UnauthorizedException('Facebook user registration failed');
    }
  }

  // forget password
  async forgotPassword(email: string) {
    try {
      const userExists = await this.helperService.userExistsByEmail(email);

      if (!userExists) {
        throw new NotFoundException('User not found');
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = getLocalDateTime(10);

      await this.prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt },
      });
      await this.mailService.sendMail(
        email,
        'Password Reset OTP',
        `<p>Your OTP code is: <strong>${otp}</strong></p>`,
      );
      return ApiResponse.success(null, 'OTP sent to email for password reset');
    } catch (error) {
      throw new UnauthorizedException('Forgot password failed', error);
    }
  }

  // verify otp  reset password
  async verifyOtpForResetPassword(EmailAndOtpDto: EmailAndOtpDto) {
    try {
      const { email, otp } = EmailAndOtpDto;
      const userExists = await this.helperService.userExistsByEmail(email);

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      if (userExists.otp !== otp) {
        throw new UnauthorizedException('Invalid OTP');
      }

      const currentTime = new Date(getLocalDateTime(0));
      if (
        !userExists.otpExpiresAt ||
        !(
          typeof userExists.otpExpiresAt === 'string' ||
          typeof userExists.otpExpiresAt === 'number' ||
          (userExists.otpExpiresAt as any) instanceof Date
        ) ||
        new Date(userExists.otpExpiresAt as string | number | Date) <
        currentTime
      ) {
        throw new UnauthorizedException('OTP expired');
      }

      // const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiresAt: null },
      });

      return ApiResponse.success(
        null,
        'Otp verified successfully, Please give me new passwords',
      );
    } catch (error) {
      console.error('Error verifying reset password:', error);
      throw new UnauthorizedException('Reset password verification failed');
    }
  }

  // set new password
  async resetPassword(email: string, newPassword: string) {
    try {
      const userExists = await this.helperService.userExistsByEmail(email);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      return ApiResponse.success(null, 'Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      throw new UnauthorizedException('Reset password failed');
    }
  }

  // Change password
  async changePassword(
    email: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await this.helperService.userExistsByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.password) {
        throw new UnauthorizedException('Old password is incorrect');
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Old password is incorrect');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      return ApiResponse.success(null, 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      throw new UnauthorizedException('Change password failed');
    }
  }
  // user update
  async updateUser(id: string, data: UpdateUserDto) {
    console.log(id, data);
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return ApiResponse.success(user, 'User updated successfully');
      // return ApiResponse.success(user, 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw new UnauthorizedException('Update user failed');
    }
  }

  async resendOtp(email: string) {
    try {
      const userExists = await this.helperService.userExistsByEmail(email);
      console.log(userExists);
      if (!userExists) {
        throw new NotFoundException('User not found');
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = getLocalDateTime(10);
      await this.prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt },
      });

      await this.mailService.sendMail(
        email,
        'Resend OTP',
        `<p>Your OTP code is: <strong>${otp}</strong></p>`,
      );
      return ApiResponse.success(otp, 'OTP resent to email successfully');
    } catch (error) {
      return ApiResponse.error('Resend OTP failed', error);
    }
  }
}
