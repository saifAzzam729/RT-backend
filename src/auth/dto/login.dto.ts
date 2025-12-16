import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'User email address (required if phone is not provided)',
    example: 'user@example.com',
  })
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required when phone is not provided' })
  email?: string;

  @ApiPropertyOptional({
    description: 'User phone number (required if email is not provided)',
    example: '+1234567890',
  })
  @ValidateIf((o) => !o.email)
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required when email is not provided' })
  phone?: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}


