import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus, Sector } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @ApiProperty({
    description: 'ID of the user posting the job',
    example: '4894dac6-170a-476f-bab5-7bf7d1174d0d',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Job type',
    example: 'Full-time',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Sector (WASH, FSL, etc.)',
    enum: Sector,
    example: Sector.WASH,
  })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @ApiPropertyOptional({
    description: 'About the company',
    example: 'We are a leading technology company...',
  })
  @IsOptional()
  @IsString()
  about_company?: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for an experienced software engineer...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Project summary',
    example: 'This project involves developing a new platform...',
  })
  @IsOptional()
  @IsString()
  project_summary?: string;

  @ApiPropertyOptional({
    description: 'Job requirements',
    example: '5+ years of experience, knowledge of TypeScript...',
  })
  @IsOptional()
  @IsString()
  requirements?: string;

  @ApiPropertyOptional({
    description: 'Application deadline (ISO date string)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiProperty({
    description: 'Job status (active or closed)',
    enum: JobStatus,
    example: JobStatus.active,
  })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiPropertyOptional({
    description: 'Project duration',
    example: '6 months',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Estimated start date (ISO date string)',
    example: '2024-02-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  estimated_start_date?: string;

  @ApiPropertyOptional({
    description: 'Link to tender/job documents',
    example: 'https://example.com/documents',
  })
  @IsOptional()
  @IsUrl()
  tender_documents_link?: string;

  @ApiPropertyOptional({
    description: 'URL to uploaded file',
    example: 'https://storage.example.com/files/document.pdf',
  })
  @IsOptional()
  @IsString()
  file_upload_url?: string;

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


