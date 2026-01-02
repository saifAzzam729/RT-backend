import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SignUpRequestStatus } from '@prisma/client';

export class ApproveSignUpRequestDto {
  @ApiProperty({
    description: 'Status action: approved, rejected, or need_more_info',
    enum: SignUpRequestStatus,
    example: SignUpRequestStatus.approved,
  })
  @IsEnum(SignUpRequestStatus, {
    message: 'Status must be one of: approved, rejected, need_more_info',
  })
  status: SignUpRequestStatus;

  @ApiPropertyOptional({
    description: 'Reason note (required for rejected and need_more_info status)',
    example: 'Please provide additional documentation',
  })
  @IsOptional()
  @IsString()
  reason_note?: string;
}

