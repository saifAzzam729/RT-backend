import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyToJobDto {
  @ApiPropertyOptional({
    description: 'Cover letter for the job application',
    example: 'I am writing to express my interest in this position...',
  })
  @IsOptional()
  @IsString()
  cover_letter?: string;

  @ApiPropertyOptional({
    description: 'URL to the resume file',
    example: 'https://storage.example.com/resumes/resume.pdf',
  })
  @IsOptional()
  @IsString()
  resume_url?: string;
}


