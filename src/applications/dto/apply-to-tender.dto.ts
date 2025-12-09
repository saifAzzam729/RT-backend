import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyToTenderDto {
  @ApiPropertyOptional({
    description: 'Cover letter for the tender application',
    example: 'I am writing to express my interest in this tender...',
  })
  @IsOptional()
  @IsString()
  cover_letter?: string;

  @ApiPropertyOptional({
    description: 'URL to the proposal/resume file',
    example: 'https://storage.example.com/proposals/proposal.pdf',
  })
  @IsOptional()
  @IsString()
  resume_url?: string;
}


