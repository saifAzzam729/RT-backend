import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryJobsDto {
  @ApiPropertyOptional({
    description: 'Search query to filter jobs by title or description',
    example: 'software engineer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by job category',
    example: 'Technology',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by job location',
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


