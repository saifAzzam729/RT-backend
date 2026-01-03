import { IsEnum, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApproveEntityDto {
  @ApiProperty({
    description: 'Type of entity to approve',
    enum: ['organization', 'company', 'user'],
    example: 'organization',
  })
  @IsEnum(['organization', 'company', 'user'])
  entityType: 'organization' | 'company' | 'user';

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


