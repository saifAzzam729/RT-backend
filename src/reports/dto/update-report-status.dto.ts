import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';

export class UpdateReportStatusDto {
  @ApiProperty({
    description: 'New status for the report',
    enum: ReportStatus,
    example: ReportStatus.resolved,
  })
  @IsEnum(ReportStatus)
  status: ReportStatus;
}


