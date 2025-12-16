import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, password, full_name, role, phone } = signUpDto;

    // Check if user already exists
    const existingUser = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if phone number is already in use (if provided)
    if (phone) {
      const existingPhoneUser = await this.prisma.profile.findFirst({
        where: { phone },
      });

      if (existingPhoneUser) {
        throw new ConflictException('User with this phone number already exists');
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = this.emailService.generateOTP();
    const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = await this.prisma.profile.create({
      data: {
        email,
        password_hash,
        full_name,
        role,
        phone,
        email_verification_otp: otp,
        otp_expires_at,
        email_verified: false,
      },
    });

    // Send OTP email
    await this.emailService.sendOTP(email, otp, full_name);

    return {
      message: 'User created successfully. Please check your email for verification code.',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    // Validate that either email or phone is provided
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided');
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await this.prisma.profile.findUnique({
        where: { email },
      });
    } else if (phone) {
      user = await this.prisma.profile.findFirst({
        where: { phone },
      });
    }

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.email_verified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;

    const user = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.email_verification_otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (user.otp_expires_at && user.otp_expires_at < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    // Update user
    await this.prisma.profile.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        email_verification_otp: null,
        otp_expires_at: null,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async resendOTP(email: string) {
    const user = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    // Generate new OTP
    const otp = this.emailService.generateOTP();
    const otp_expires_at = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.profile.update({
      where: { id: user.id },
      data: {
        email_verification_otp: otp,
        otp_expires_at,
      },
    });

    // Send OTP email
    await this.emailService.sendOTP(email, otp, user.full_name || undefined);

    return {
      message: 'Verification code sent successfully',
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email,
        storedToken.user.role,
      );

      // Delete old refresh token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const jwtSecret = this.configService.get<string>('jwt.secret');
    const jwtExpiresIn = this.configService.get<string>('jwt.expiresIn') || '15m';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    const refreshExpiresIn = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    if (!jwtSecret || !refreshSecret) {
      throw new Error('JWT secrets are not configured');
    }

    const accessToken = this.jwtService.sign(
      payload,
      {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn,
      } as any,
    );

    const refreshToken = this.jwtService.sign(
      payload,
      {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      } as any,
    );

    // Store refresh token in database
    const expiresInMs = this.parseExpiryToMs(refreshExpiresIn);
    const expires_at = new Date(Date.now() + expiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: userId,
        expires_at,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000; // 7 days default
    }
  }
}


