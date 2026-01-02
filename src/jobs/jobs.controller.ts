import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.company, UserRole.organization)
  @ApiOperation({ summary: 'Create a new job posting (company/organization only)' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Company or Organization role required' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createJobDto: CreateJobDto,
  ) {
    return this.jobsService.create(user.id, createJobDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all jobs (public)' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  findAll(@Query() queryDto: QueryJobsDto) {
    return this.jobsService.findAll(queryDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID (public)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id, true);
  }

  @Get('id/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a job by ID (authenticated)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOneAuthenticated(@Param('id') id: string) {
    return this.jobsService.findOne(id, false);
  }

  @Get('company/:companyId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get jobs by company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'List of jobs for the company' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByCompany(@Param('companyId') companyId: string) {
    return this.jobsService.findByCompany(companyId);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get jobs for current user' })
  @ApiResponse({ status: 200, description: 'List of jobs for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMy(@CurrentUser() user: CurrentUserData) {
    return this.jobsService.findByUserId(user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, user.id, updateJobDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.jobsService.remove(id, user.id);
  }
}


