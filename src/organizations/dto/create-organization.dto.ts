import { IsNotEmpty, IsString, IsOptional, IsArray, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'ABC Construction Ltd',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Organization description',
    example: 'A leading construction company...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Organization website URL',
    example: 'https://www.abcconstruction.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'URL to organization logo',
    example: 'https://storage.example.com/logos/abc.png',
  })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Organization location',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Organization industry',
    example: 'Construction',
  })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({
    description: 'Business license number',
    example: 'LIC-12345',
  })
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiPropertyOptional({
    description: 'URL to license file',
    example: 'https://storage.example.com/licenses/license.pdf',
  })
  @IsOptional()
  @IsString()
  license_file_url?: string;

  @ApiPropertyOptional({
    description: 'List of work sectors',
    example: ['Construction', 'Infrastructure'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  work_sectors?: string[];
}


