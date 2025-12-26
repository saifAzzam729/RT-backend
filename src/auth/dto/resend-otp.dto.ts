import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  @ApiProperty({
    description: 'User ID',
    example: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}


