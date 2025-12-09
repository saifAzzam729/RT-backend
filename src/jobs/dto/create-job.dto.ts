import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({
    description: 'ID of the company posting the job',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  company_id: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for an experienced software engineer...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Job requirements',
    example: '5+ years of experience, knowledge of TypeScript...',
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Minimum salary',
    example: 50000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salary_min?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    example: 100000,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salary_max?: number;

  @ApiPropertyOptional({
    description: 'Employment type',
    example: 'Full-time',
  })
  @IsOptional()
  @IsString()
  employment_type?: string;

  @ApiPropertyOptional({
    description: 'Required experience level',
    example: 'Senior',
  })
  @IsOptional()
  @IsString()
  experience_level?: string;

  @ApiProperty({
    description: 'Job status',
    enum: JobStatus,
    example: JobStatus.open,
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiPropertyOptional({
    description: 'Job location',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Job category',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  category?: string;
}


