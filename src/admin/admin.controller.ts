import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ApproveEntityDto } from './dto/approve-entity.dto';
import { UpdatePricingPlanDto } from './dto/update-pricing-plan.dto';
import { CreatePricingPlanDto } from './dto/create-pricing-plan.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { ApproveSignUpRequestDto } from './dto/approve-signup-request.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

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

  @Get('pricing')
  @ApiOperation({ summary: 'Get all pricing plans (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all pricing plans' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAllPricingPlans() {
    return this.adminService.getAllPricingPlans();
  }

  @Get('pricing/:planId')
  @ApiOperation({ summary: 'Get a specific pricing plan (admin only)' })
  @ApiParam({ name: 'planId', description: 'Pricing plan ID' })
  @ApiResponse({ status: 200, description: 'Pricing plan details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Pricing plan not found' })
  getPricingPlan(@Param('planId') planId: string) {
    return this.adminService.getPricingPlan(planId);
  }

  @Post('pricing')
  @ApiOperation({ summary: 'Create a new pricing plan (admin only)' })
  @ApiResponse({ status: 201, description: 'Pricing plan created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Plan ID already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  createPricingPlan(@Body() createDto: CreatePricingPlanDto) {
    return this.adminService.createPricingPlan(createDto);
  }

  @Patch('pricing/:planId')
  @ApiOperation({ summary: 'Update a pricing plan (admin only)' })
  @ApiParam({ name: 'planId', description: 'Pricing plan ID' })
  @ApiResponse({ status: 200, description: 'Pricing plan updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Pricing plan not found' })
  updatePricingPlan(
    @Param('planId') planId: string,
    @Body() updateDto: UpdatePricingPlanDto,
  ) {
    return this.adminService.updatePricingPlan(planId, updateDto);
  }

  @Delete('pricing/:planId')
  @ApiOperation({ summary: 'Delete a pricing plan (admin only)' })
  @ApiParam({ name: 'planId', description: 'Pricing plan ID' })
  @ApiResponse({ status: 200, description: 'Pricing plan deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Pricing plan not found' })
  deletePricingPlan(@Param('planId') planId: string) {
    return this.adminService.deletePricingPlan(planId);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', description: 'Page number (default: 1)', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page (default: 20)', required: false, type: Number })
  @ApiQuery({ name: 'search', description: 'Search by email, name, or phone', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of users with pagination' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getAllUsers(pageNum, limitNum, search);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get a specific user by ID (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserById(@Param('userId') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update a user (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email or phone already in use' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUser(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(userId, updateDto);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot delete admin users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  @Patch('users/:userId/plan')
  @ApiOperation({ summary: 'Update user plan (admin only)' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User plan updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid plan ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserPlan(
    @Param('userId') userId: string,
    @Body() updatePlanDto: UpdateUserPlanDto,
  ) {
    return this.adminService.updateUserPlan(userId, updatePlanDto);
  }

  @Get('signup-requests')
  @ApiOperation({ summary: 'Get all signup requests (admin only)' })
  @ApiQuery({ name: 'page', description: 'Page number (default: 1)', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Items per page (default: 20)', required: false, type: Number })
  @ApiQuery({ name: 'status', description: 'Filter by status (pending, approved, rejected, need_more_info)', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of signup requests with pagination' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAllSignUpRequests(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adminService.getAllSignUpRequests(pageNum, limitNum, status);
  }

  @Get('signup-requests/:requestId')
  @ApiOperation({ summary: 'Get signup request by ID (admin only)' })
  @ApiParam({ name: 'requestId', description: 'Signup request ID' })
  @ApiResponse({ status: 200, description: 'Signup request details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Signup request not found' })
  getSignUpRequestById(@Param('requestId') requestId: string) {
    return this.adminService.getSignUpRequestById(requestId);
  }

  @Post('signup-requests/:requestId/approve')
  @ApiOperation({ summary: 'Approve/reject/request more info for signup request (admin only)' })
  @ApiParam({ name: 'requestId', description: 'Signup request ID' })
  @ApiResponse({ status: 200, description: 'Signup request status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid status or missing reason note' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Signup request not found' })
  approveSignUpRequest(
    @Param('requestId') requestId: string,
    @Body() approveDto: ApproveSignUpRequestDto,
    @CurrentUser() admin: CurrentUserData,
  ) {
    return this.adminService.approveSignUpRequest(requestId, approveDto, admin.id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email or phone already in use' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }
}


