import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FieldValidationDto {
  @ApiPropertyOptional({ description: 'Minimum value/length', example: 1 })
  @IsOptional()
  @IsNumber()
  min?: number;

  @ApiPropertyOptional({ description: 'Maximum value/length', example: 100 })
  @IsOptional()
  @IsNumber()
  max?: number;

  @ApiPropertyOptional({ description: 'Validation pattern (regex)', example: '^[a-zA-Z0-9]+$' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Accepted file types (for file inputs)', example: '.pdf,.doc,.docx' })
  @IsOptional()
  @IsString()
  accept?: string;
}

class FormFieldDto {
  @ApiProperty({ description: 'Field ID', example: 'email' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Field name (for form submission)', example: 'email' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Field label', example: 'Email Address' })
  @IsString()
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: ['text', 'email', 'password', 'select', 'textarea', 'date', 'number', 'file'],
    example: 'email',
  })
  @IsEnum(['text', 'email', 'password', 'select', 'textarea', 'date', 'number', 'file'])
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'date' | 'number' | 'file';

  @ApiProperty({ description: 'Whether field is required', example: true })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({ description: 'Placeholder text', example: 'Enter your email' })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Options for select fields', type: [String], example: ['Option 1', 'Option 2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ description: 'Field validation rules', type: FieldValidationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FieldValidationDto)
  validation?: FieldValidationDto;

  @ApiProperty({ description: 'Field display order', example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ description: 'Whether field is visible', example: true })
  @IsBoolean()
  visible: boolean;
}

export class FormConfigDto {
  @ApiProperty({
    description: 'Form type',
    enum: ['registration', 'job', 'tender'],
    example: 'registration',
  })
  @IsEnum(['registration', 'job', 'tender'])
  formType: 'registration' | 'job' | 'tender';

  @ApiProperty({ description: 'Form title', example: 'User Registration' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Form description', example: 'Create your account to get started' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Submit button text', example: 'Sign Up' })
  @IsString()
  submitButtonText: string;

  @ApiProperty({ description: 'Form fields', type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields: FormFieldDto[];
}
