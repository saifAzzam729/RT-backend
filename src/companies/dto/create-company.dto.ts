import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Company name',
    example: 'Acme Corporation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Company description',
    example: 'A leading technology company...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Company website URL',
    example: 'https://www.acme.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'URL to company logo',
    example: 'https://storage.example.com/logos/acme.png',
  })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Company location',
    example: 'San Francisco, CA',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Company industry',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Company size',
    example: '100-500 employees',
  })
  @IsOptional()
  @IsString()
  size?: string;
}


