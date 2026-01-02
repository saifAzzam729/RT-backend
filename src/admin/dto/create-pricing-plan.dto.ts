import { IsString, IsNumber, IsArray, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePricingPlanDto {
  @ApiProperty({
    description: 'Unique plan identifier',
    example: 'tender-single',
  })
  @IsString()
  @IsNotEmpty()
  plan_id: string;

  @ApiProperty({
    description: 'Plan name',
    example: 'Single Tender',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Post one tender',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Plan price',
    example: 25,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Period type',
    example: 'one-time',
    enum: ['one-time', 'yearly'],
  })
  @IsString()
  @IsNotEmpty()
  period: string;

  @ApiProperty({
    description: 'Plan type',
    example: 'tender',
    enum: ['tender', 'job', 'combined', 'vendor', 'vendorAdvertisement'],
  })
  @IsString()
  @IsNotEmpty()
  plan_type: string;

  @ApiProperty({
    description: 'Plan features',
    example: ['Post 1 tender', 'Unlimited applications', 'Standard visibility'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  features: string[];
}














