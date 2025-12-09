import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new report (public)' })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user?: CurrentUserData,
  ) {
    return this.reportsService.create(createReportDto, user?.id);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get all reports (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll() {
    return this.reportsService.findAll();
  }

  @Get('notifications')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get report notifications (admin only)' })
  @ApiResponse({ status: 200, description: 'List of report notifications' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getNotifications() {
    return this.reportsService.getNotifications();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get a report by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Update report status (admin only)' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, updateDto);
  }
}


