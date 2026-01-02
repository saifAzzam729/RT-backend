import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';

export class UpdateJobDto extends PartialType(OmitType(CreateJobDto, ['userId'] as const)) {}


