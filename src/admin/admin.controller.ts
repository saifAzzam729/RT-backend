import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApproveEntityDto } from './dto/approve-entity.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@Roles(UserRole.admin)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('approve')
  @ApiOperation({ summary: 'Approve or reject an entity (admin only)' })
  @ApiResponse({ status: 200, description: 'Entity approval status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  approveEntity(@Body() approveDto: ApproveEntityDto) {
    return this.adminService.approveEntity(approveDto);
  }

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals (admin only)' })
  @ApiResponse({ status: 200, description: 'List of pending approvals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getPendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics data (admin only)' })
  @ApiResponse({ status: 200, description: 'Analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAnalytics() {
    return this.adminService.getAnalytics();
  }
}


