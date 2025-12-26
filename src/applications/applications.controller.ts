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
import { ApplicationsService } from './applications.service';
import { ApplyToJobDto } from './dto/apply-to-job.dto';
import { ApplyToTenderDto } from './dto/apply-to-tender.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('applications')
@ApiBearerAuth('JWT-auth')
@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'jobId', required: false, description: 'Filter by job ID' })
  @ApiQuery({ name: 'tenderId', required: false, description: 'Filter by tender ID' })
  @ApiResponse({ status: 200, description: 'List of applications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Query() queryDto: QueryApplicationsDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.findAll(queryDto, user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.findOne(id, user.id, user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.delete(id, user.id, user.role);
  }

  // Job Applications
  @Post('jobs/:id/apply')
  @ApiOperation({ summary: 'Apply to a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  applyToJob(
    @Param('id') jobId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() applyDto: ApplyToJobDto,
  ) {
    return this.applicationsService.applyToJob(user.id, jobId, applyDto);
  }

  @Get('jobs/my')
  @ApiOperation({ summary: 'Get my job applications' })
  @ApiResponse({ status: 200, description: 'List of job applications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyJobApplications(@CurrentUser() user: CurrentUserData) {
    return this.applicationsService.getMyJobApplications(user.id);
  }

  @Get('jobs/company/:companyId')
  @ApiOperation({ summary: 'Get job applications for a company' })
  @ApiParam({ name: 'companyId', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'List of job applications for the company' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getJobApplicationsForCompany(
    @Param('companyId') companyId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.getJobApplicationsForCompany(companyId, user.id);
  }

  @Patch('jobs/:id/status')
  @ApiOperation({ summary: 'Update job application status' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  updateJobApplicationStatus(
    @Param('id') applicationId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateJobApplicationStatus(
      applicationId,
      user.id,
      updateDto,
    );
  }

  // Tender Applications
  @Post('tenders/:id/apply')
  @ApiOperation({ summary: 'Apply to a tender' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  applyToTender(
    @Param('id') tenderId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() applyDto: ApplyToTenderDto,
  ) {
    return this.applicationsService.applyToTender(user.id, tenderId, applyDto);
  }

  @Get('tenders/my')
  @ApiOperation({ summary: 'Get my tender applications' })
  @ApiResponse({ status: 200, description: 'List of tender applications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyTenderApplications(@CurrentUser() user: CurrentUserData) {
    return this.applicationsService.getMyTenderApplications(user.id);
  }

  @Get('tenders/organization/:organizationId')
  @ApiOperation({ summary: 'Get tender applications for an organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'List of tender applications for the organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTenderApplicationsForOrganization(
    @Param('organizationId') organizationId: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.applicationsService.getTenderApplicationsForOrganization(
      organizationId,
      user.id,
    );
  }

  @Patch('tenders/:id/status')
  @ApiOperation({ summary: 'Update tender application status' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  updateTenderApplicationStatus(
    @Param('id') applicationId: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateDto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateTenderApplicationStatus(
      applicationId,
      user.id,
      updateDto,
    );
  }
}


