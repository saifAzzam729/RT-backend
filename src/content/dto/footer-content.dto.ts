import { IsString, IsOptional, IsObject, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Facebook URL', example: 'https://facebook.com/example' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ description: 'Twitter URL', example: 'https://twitter.com/example' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL', example: 'https://linkedin.com/company/example' })
  @IsOptional()
  @IsString()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Instagram URL', example: 'https://instagram.com/example' })
  @IsOptional()
  @IsString()
  instagram?: string;
}

class PlatformLinkDto {
  @ApiProperty({ description: 'Link name', example: 'About Us' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Link URL', example: '/about' })
  @IsString()
  href: string;
}

class HashtagsDto {
  @ApiProperty({ description: 'Jobs hashtag', example: '#RTJobs' })
  @IsString()
  jobs: string;

  @ApiProperty({ description: 'Tenders hashtag', example: '#RTTenders' })
  @IsString()
  tenders: string;
}

export class FooterContentDto {
  @ApiProperty({ description: 'Footer description', example: 'RT-SYR Platform for Jobs and Tenders' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Contact email', example: 'contact@rtsyr.com' })
  @IsString()
  contactEmail: string;

  @ApiProperty({ description: 'Contact location', example: 'Damascus, Syria' })
  @IsString()
  contactLocation: string;

  @ApiPropertyOptional({ description: 'Social media links', type: SocialLinksDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @ApiProperty({ description: 'Platform navigation links', type: [PlatformLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformLinkDto)
  platformLinks: PlatformLinkDto[];

  @ApiProperty({ description: 'Support links', type: [PlatformLinkDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlatformLinkDto)
  supportLinks: PlatformLinkDto[];

  @ApiProperty({ description: 'Copyright text', example: '© 2024 RT-SYR. All rights reserved.' })
  @IsString()
  copyright: string;

  @ApiProperty({ description: 'Hashtags', type: HashtagsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => HashtagsDto)
  hashtags: HashtagsDto;
}
