import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, PlanStatus } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    example: UserRole.user,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'URL to user avatar',
    example: 'https://storage.example.com/avatars/avatar.png',
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({
    description: 'User bio',
    example: 'Experienced software engineer...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Email verified status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  email_verified?: boolean;

  @ApiPropertyOptional({
    description: 'Plan status',
    enum: PlanStatus,
    example: PlanStatus.paid,
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  plan_status?: PlanStatus;
}









