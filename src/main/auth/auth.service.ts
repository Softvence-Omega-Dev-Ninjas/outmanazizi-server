import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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
import { ConfigService } from '@nestjs/config';
import { GoogleAuthDto } from './dto/google.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) { }

  async register(registerDto: RegisterDto) {
    try {
      this.logger.log(`Registering user: ${registerDto.email}`);
      const userExists = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (userExists?.provider === 'GOOGLE') {
        this.logger.warn(`User ${registerDto.email} attempted to register with Google account`);
        throw new BadRequestException('Please log in using Google authentication');
      }
      if (userExists) {
        this.logger.warn(`User registration failed: ${registerDto.email} already exists`);
        throw new BadRequestException('You are already registered. Please log in.');
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

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
        const data = { ...user, otp };
        this.logger.log(`User registered successfully: ${registerDto.email}`);
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
        this.logger.log(`Service Provider user created: ${registerDto.email}`);
        const serviceProvider = await this.prisma.serviceProvider.create({
          data: {
            userId: user.id,
            isProfileCompleted: false,
            address: '',
          },
        });
        const data = {
          ...serviceProvider,
          otp,
        };
        this.logger.log(`Service Provider registered successfully: ${registerDto.email}`);
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
      this.logger.log(`OTP sent to email: ${registerDto.email}`);
      return ApiResponse.success(null, 'Registration successful. Please verify OTP sent to your email.');

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
      if (user?.provider === 'GOOGLE') {
        this.logger.warn(`User ${email} attempted to register with Google account`);
        throw new BadRequestException('Please log in using Google authentication');
      }
      if (!user) {
        this.logger.warn(`User ${email} not found`);
        throw new NotFoundException('User not found');
      }
      if (user.otp !== otp) {
        this.logger.warn(`Invalid OTP attempt for user ${email}`);
        throw new BadRequestException('Invalid OTP');
      }
      const currentTime = new Date(getLocalDateTime(0));
      if (currentTime > new Date(user.otpExpiresAt as string | number | Date)) {
        this.logger.warn(`OTP expired for user ${email}`);
        throw new BadRequestException('OTP expired');
      }
      const data = await this.prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiresAt: null, isEmailVerified: true },
      });
      this.logger.log(`OTP verified and user created: ${email}`);
      return ApiResponse.success(data, 'OTP verified successfully and user created');
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      return ApiResponse.error('OTP verification failed', errorMessage);
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
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      return ApiResponse.error('Upload profile picture failed', errorMessage);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const userExists = await this.helperService.userExistsByEmail(loginDto.email);
      this.logger.debug(`User existence check for email ${loginDto.email}: ${userExists ? 'found' : 'not found'}`);

      if (userExists.provider === 'GOOGLE') {
        this.logger.warn(`Attempted login with email ${loginDto.email} using non-Google method`);
        throw new BadRequestException('Please log in using Google authentication');
      }
      if (!userExists?.isEmailVerified) {
        this.logger.warn(`Email not verified for user: ${loginDto.email}`);
        throw new BadRequestException('Please verify your email first');
      }

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      if (!userExists.password) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (userExists.role !== loginDto.role) {
        throw new UnauthorizedException('User role mismatch');
      }
      const passwordMatch = await bcrypt.compare(loginDto.password, userExists.password);

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
      if (!serviceProvider?.isVerifiedFromAdmin) {
        this.logger.log(`Service provider ${loginDto.email} is verified by admin`);
        throw new UnauthorizedException('Your account is not verified by admin yet, Provide valid documents and try again later');
      }
      const token = await this.helperService.createTokenEntry(userExists.id, payload);
      if (userExists.role === UserRole.SERVICE_PROVIDER) {
        return ApiResponse.success(
          { token, serviceProvider },
          'Service provider logged in successfully',
        );
      }
      return ApiResponse.success({ token, userExists }, 'User logged in successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return ApiResponse.error('Login failed', errorMessage);
    }
  }
  // get profile by id
  async getProfileById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: { serviceProvider: true, toReviews: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role === UserRole.SERVICE_PROVIDER) {
        const serviceProvider = await this.prisma.serviceProvider.findFirst({
          where: { userId: user.id },
        });
        return ApiResponse.success({ user, serviceProvider }, 'User profile fetched successfully');
      }
      return ApiResponse.success(user, 'User profile fetched successfully');
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return ApiResponse.error('Get user profile failed', errorMessage);
    }
  }
  // forget password
  async forgotPassword(email: string) {
    try {
      const userExists = await this.helperService.userExistsByEmail(email);
      if (userExists?.provider === 'GOOGLE') {
        this.logger.warn(`User ${email} attempted to register with Google account`);
        throw new BadRequestException('Please log in using Google authentication');
      }
      if (!userExists) {
        this.logger.warn(`User ${email} not found`);
        throw new NotFoundException('User not found');
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = getLocalDateTime(10);

      this.logger.log(`Sending OTP to email: ${email}`);
      await this.prisma.user.update({
        where: { email },
        data: { otp, otpExpiresAt },
      });
      this.logger.log(`OTP generated for user ${email}, sending email now.`);
      await this.mailService.sendMail(
        email,
        'Password Reset OTP',
        `<p>Your OTP code is: <strong>${otp}</strong></p>`,
      );
      this.logger.log(`OTP sent to email: ${email}`);
      return ApiResponse.success(null, 'OTP sent to email for password reset');
    } catch (error) {
      this.logger.error(`Error in forgot password for email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new UnauthorizedException('Forgot password failed', error as UnauthorizedException);
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
        new Date(userExists.otpExpiresAt as string | number | Date) < currentTime
      ) {
        throw new UnauthorizedException('OTP expired');
      }

      // const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiresAt: null },
      });

      return ApiResponse.success(null, 'Otp verified successfully, Please give me new passwords');
    } catch (error) {
      console.error('Error verifying reset password:', error);
      throw new UnauthorizedException('Reset password verification failed');
    }
  }

  // set new password
  async resetPassword(email: string, newPassword: string) {
    try {
      const userExists = await this.helperService.userExistsByEmail(email);
      if (userExists?.provider === 'GOOGLE') {
        this.logger.warn(`User ${email} attempted to register with Google account`);
        throw new BadRequestException('Please log in using Google authentication');
      }
      if (!userExists) {
        this.logger.warn(`User ${email} not found`);
        throw new NotFoundException('User not found');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      this.logger.log(`Resetting password for user ${email}`);
      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      this.logger.log(`Password reset successfully for user ${email}`);
      return ApiResponse.success(null, 'Password reset successfully');
    } catch (error) {
      this.logger.error(`Error resetting password for email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new UnauthorizedException(errorMessage);
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
  // user update
  async updateUser(id: string, data: UpdateUserDto) {

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          address: data.address,
          name: data.name,
          phone: data.phone,
        }
      });
      return ApiResponse.success(user, 'User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw new UnauthorizedException('Update user failed');
    }
  }

  async resendOtp(email: string) {
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
        'Resend OTP',
        `<p>Your OTP code is: <strong>${otp}</strong></p>`,
      );
      return ApiResponse.success(otp, 'OTP resent to email successfully');
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Unknown error';
      return ApiResponse.error('Resend OTP failed', errorMessage);
    }
  }


  async googleAuth(googleAuthDto: GoogleAuthDto) {
    this.logger.log('Google Auth request received');
    this.logger.debug(`Payload: ${JSON.stringify(googleAuthDto)}`);

    try {
      const { email, name, picture, role } = googleAuthDto;

      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new user
        const newUser = await this.prisma.user.create({
          data: {
            email,
            name,
            picture,
            role,
            phone: '',
            provider: 'GOOGLE',
            isEmailVerified: true,
          },
        });

        if (!newUser || !newUser.id) {
          this.logger.error(`User creation failed for email: ${email}`);
          throw new InternalServerErrorException('User creation failed');
        }

        // If service provider, create related record
        if (role === UserRole.SERVICE_PROVIDER as UserRole) {
          try {
            await this.prisma.serviceProvider.create({
              data: { userId: newUser.id, isProfileCompleted: false, address: '' },
            });
            this.logger.log(`ServiceProvider record created for user: ${email}`);
          } catch (err) {
            this.logger.error(`ServiceProvider creation failed for user: ${email}`, err);
            // Optional: Rollback user creation or continue depending on business logic
          }
        }

        this.logger.log(`New user created successfully: ${email}`);

        const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
        const token = await this.helperService.createTokenEntry(newUser.id, payload);
        return ApiResponse.success(token, 'User created successfully');
      }

      // Existing user
      if (user.role !== role) {
        this.logger.warn(`Role mismatch for user ${email}: expected ${role}, found ${user.role}`);
        throw new BadRequestException('User role mismatch. Please use the correct login method.');
      }

      const payload = { sub: user.id, email: user.email, role: user.role };
      const token = await this.helperService.createTokenEntry(user.id, payload);
      this.logger.log(`User logged in successfully: ${email}`);
      return ApiResponse.success(token, 'User logged in successfully');

    } catch (error) {
      this.logger.error('Google Auth failed', error instanceof Error ? error.stack : error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }

}