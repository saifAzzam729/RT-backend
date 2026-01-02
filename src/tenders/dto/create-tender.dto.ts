import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenderStatus, Sector } from '@prisma/client';

export class CreateTenderDto {
  @ApiProperty({
    description: 'ID of the organization posting the tender',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  organization_id: string;

  @ApiProperty({
    description: 'Tender title',
    example: 'Construction Project Tender',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Tender type',
    example: 'Construction',
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
    description: 'About the organization',
    example: 'We are a leading construction organization...',
  })
  @IsOptional()
  @IsString()
  about_organization?: string;

  @ApiProperty({
    description: 'Tender description',
    example: 'We are seeking contractors for a construction project...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Project summary',
    example: 'This project involves building a new facility...',
  })
  @IsOptional()
  @IsString()
  project_summary?: string;

  @ApiPropertyOptional({
    description: 'Tender requirements',
    example: 'Must have 5+ years of experience, valid license...',
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
    description: 'Tender status (active or closed)',
    enum: TenderStatus,
    example: TenderStatus.active,
  })
  @IsEnum(TenderStatus)
  status: TenderStatus;

  @ApiPropertyOptional({
    description: 'Project duration',
    example: '12 months',
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
    description: 'Link to tender documents',
    example: 'https://example.com/tender-documents',
  })
  @IsOptional()
  @IsUrl()
  tender_documents_link?: string;

  @ApiPropertyOptional({
    description: 'URL to uploaded file',
    example: 'https://storage.example.com/files/tender.pdf',
  })
  @IsOptional()
  @IsString()
  file_upload_url?: string;

  @ApiPropertyOptional({
    description: 'Tender location',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Tender category',
    example: 'Construction',
  })
  @IsOptional()
  @IsString()
  category?: string;
}


