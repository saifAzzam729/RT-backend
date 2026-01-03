import { IsString, IsNumber, IsArray, IsOptional, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePricingPlanDto {
  @ApiPropertyOptional({
    description: 'Plan name',
    example: 'Single Tender',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Post one tender',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Plan price',
    example: 88888,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Period type',
    example: 'one-time',
    enum: ['one-time', 'yearly'],
  })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({
    description: 'Plan type',
    example: 'tender',
    enum: ['tender', 'job', 'combined', 'vendor', 'vendorAdvertisement'],
  })
  @IsOptional()
  @IsString()
  plan_type?: string;

  @ApiPropertyOptional({
    description: 'Plan features',
    example: ['Post 1 tender', 'Unlimited applications', 'Standard visibility'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}















