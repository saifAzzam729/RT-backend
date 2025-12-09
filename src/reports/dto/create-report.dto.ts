import { IsOptional, IsString, IsEmail, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiPropertyOptional({
    description: 'Topic of the report',
    example: 'Inappropriate Content',
  })
  @IsOptional()
  @IsString()
  report_topic?: string;

  @ApiPropertyOptional({
    description: 'Type of listing being reported',
    example: 'job',
  })
  @IsOptional()
  @IsString()
  listing_type?: string;

  @ApiPropertyOptional({
    description: 'ID of the listing being reported',
    example: 'clx1234567890',
  })
  @IsOptional()
  @IsUUID()
  listing_id?: string;

  @ApiPropertyOptional({
    description: 'URL of the listing being reported',
    example: 'https://example.com/jobs/123',
  })
  @IsOptional()
  @IsString()
  listing_url?: string;

  @ApiProperty({
    description: 'Details of the report',
    example: 'This listing contains inappropriate content...',
  })
  @IsString()
  details: string;

  @ApiPropertyOptional({
    description: 'Contact email for follow-up',
    example: 'reporter@example.com',
  })
  @IsOptional()
  @IsEmail()
  contact_email?: string;
}


