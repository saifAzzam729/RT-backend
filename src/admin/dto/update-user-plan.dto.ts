import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';

export class UpdateUserPlanDto {
  @ApiPropertyOptional({
    description: 'Pricing plan ID',
    example: 'tender-yearly',
  })
  @IsOptional()
  @IsString()
  plan_id?: string;

  @ApiPropertyOptional({
    description: 'Plan status',
    enum: PlanStatus,
    example: PlanStatus.paid,
  })
  @IsOptional()
  @IsEnum(PlanStatus)
  plan_status?: PlanStatus;

  @ApiPropertyOptional({
    description: 'Plan expiration date',
    example: '2025-12-17T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  plan_expires_at?: string;
}









