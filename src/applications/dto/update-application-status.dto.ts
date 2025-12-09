import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class UpdateApplicationStatusDto {
  @ApiProperty({
    description: 'New status for the application',
    enum: ApplicationStatus,
    example: ApplicationStatus.accepted,
  })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}


