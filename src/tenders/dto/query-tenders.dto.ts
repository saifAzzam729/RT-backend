import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTendersDto {
  @ApiPropertyOptional({
    description: 'Search query to filter tenders by title or description',
    example: 'construction',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by tender category',
    example: 'Construction',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by tender location',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'user-uuid-here',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}


