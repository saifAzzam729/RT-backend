import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryApplicationsDto {
  @ApiPropertyOptional({ description: 'Filter by user ID', example: 'uuid' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by job ID', example: 'uuid' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Filter by tender ID', example: 'uuid' })
  @IsOptional()
  @IsString()
  tenderId?: string;
}

