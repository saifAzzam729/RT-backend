import { IsEnum, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveEntityDto {
  @ApiProperty({
    description: 'Type of entity to approve',
    enum: ['organization', 'company'],
    example: 'organization',
  })
  @IsEnum(['organization', 'company'])
  entityType: 'organization' | 'company';

  @ApiProperty({
    description: 'ID of the entity to approve',
    example: 'clx1234567890',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'Approval status',
    example: true,
  })
  @IsBoolean()
  approved: boolean;
}


