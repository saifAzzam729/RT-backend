import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenderStatus } from '@prisma/client';

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

  @ApiProperty({
    description: 'Tender description',
    example: 'We are seeking contractors for a construction project...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

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
    description: 'Tender status',
    enum: TenderStatus,
    example: TenderStatus.open,
  })
  @IsEnum(TenderStatus)
  status: TenderStatus;

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


