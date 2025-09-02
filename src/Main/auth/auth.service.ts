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
import { getLocalDateTime } from 'src/utils/common/localtimeAndDate/localtime';
import { MailService } from 'src/utils/mail/mail.service';
import { ResetPasswordDto } from './dto/resetPassword';

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
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

      // Create the user
      const user = await this.prisma.user.upsert({
        where: { email: registerDto.email },
        update: {
          name: registerDto.name,
          phone: registerDto.phone,
          password: hashedPassword,
          picture: '', // Add default value for picture
        },
        create: {
          email: registerDto.email,
          name: registerDto.name,
          phone: registerDto.phone,
          password: hashedPassword,
          picture: '', // Add default value for picture
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

  // Google OAuth Save information 
  async saveGoogleUser(user: any) {
    try {
      const { email, firstName, picture, provider } = user;

      const newUser = await this.prisma.user.upsert({
        where: { email },
        update: { name: firstName, picture, provider },
        create: { email, name: firstName, picture, provider, phone: '' },
      });
      const payload = { sub: newUser.id, email: newUser.email, role: 'CONSUMER' };
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
      const payload = { sub: newUser.id, email: newUser.email, role: 'CONSUMER' };
      const token = await this.jwtService.signAsync(payload);
      return ApiResponse.success(token, 'User created successfully');
    } catch (error) {
      console.error('Error saving Facebook user:', error);
      throw new UnauthorizedException('Facebook user registration failed');
    }
  }

  // forget password
  async forgotPassword(email: string) {
    console.log('Forgot password requested for email:', email);
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
        `<p>Your OTP code is: <strong>${otp}</strong></p>`
      );
      return ApiResponse.success(null, 'Reset password email sent');
    } catch (error) {
      throw new UnauthorizedException('Forgot password failed', error);
    }
  }
  // verify reset password
  async verifyResetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { email, otp, newPassword } = resetPasswordDto;
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
          ((userExists.otpExpiresAt as any) instanceof Date)
        ) ||
        new Date(userExists.otpExpiresAt as string | number | Date) < currentTime
      ) {
        throw new UnauthorizedException('OTP expired');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword, otp: null, otpExpiresAt: null },
      });

      return ApiResponse.success(null, 'Password reset successfully');
    } catch (error) {
      console.error('Error verifying reset password:', error);
      throw new UnauthorizedException('Reset password verification failed');
    }
  }

  // Change password
  async changePassword(email: string, oldPassword: string, newPassword: string) {
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
}