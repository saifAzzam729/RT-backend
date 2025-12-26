import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlanStatus } from '@prisma/client';

export class UpdatePlanStatusDto {
  @ApiProperty({
    description: 'Plan status to set',
    enum: PlanStatus,
    example: PlanStatus.paid,
  })
  @IsEnum(PlanStatus, { message: 'Plan status must be either free or paid' })
  @IsNotEmpty()
  plan_status: PlanStatus;
}









