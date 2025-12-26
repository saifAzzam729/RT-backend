import { PartialType } from '@nestjs/mapped-types';
import { CreateContentDto } from './create-content.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContentDto extends PartialType(CreateContentDto) {
  @ApiPropertyOptional({
    description: 'Content value (can be string, object, etc.)',
    example: 'Updated content value',
  })
  @IsOptional()
  value?: string | object;

  @ApiPropertyOptional({
    description: 'Content section',
    enum: ['home', 'footer', 'form', 'general'],
    example: 'home',
  })
  @IsOptional()
  @IsEnum(['home', 'footer', 'form', 'general'])
  section?: 'home' | 'footer' | 'form' | 'general';

  @ApiPropertyOptional({
    description: 'Content type',
    enum: ['text', 'html', 'json'],
    example: 'text',
  })
  @IsOptional()
  @IsEnum(['text', 'html', 'json'])
  type?: 'text' | 'html' | 'json';
}
