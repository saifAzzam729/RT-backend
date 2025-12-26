import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContentDto {
  @ApiProperty({
    description: 'Content key (unique identifier)',
    example: 'home.hero.title',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    description: 'Content section',
    enum: ['home', 'footer', 'form', 'general'],
    example: 'home',
  })
  @IsEnum(['home', 'footer', 'form', 'general'])
  @IsNotEmpty()
  section: 'home' | 'footer' | 'form' | 'general';

  @ApiPropertyOptional({
    description: 'Content language',
    enum: ['en', 'ar'],
    default: 'en',
    example: 'en',
  })
  @IsOptional()
  @IsEnum(['en', 'ar'])
  language?: 'en' | 'ar';

  @ApiProperty({
    description: 'Content value (can be string, object, etc.)',
    example: 'Welcome to RT-SYR Platform',
  })
  @IsNotEmpty()
  value: string | object;

  @ApiPropertyOptional({
    description: 'Content type',
    enum: ['text', 'html', 'json'],
    default: 'text',
    example: 'text',
  })
  @IsOptional()
  @IsEnum(['text', 'html', 'json'])
  type?: 'text' | 'html' | 'json';
}
