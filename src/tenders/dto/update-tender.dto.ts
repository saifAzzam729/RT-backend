import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString } from 'class-validator';
import { CreateTenderDto } from './create-tender.dto';

export class UpdateTenderDto extends PartialType(OmitType(CreateTenderDto, ['organization_id'] as const)) {
  @IsOptional()
  @IsDateString()
  deadline?: string;
}


