import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteSecondaryAccountDto } from './dto/invite-secondary-account.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { TendersService } from '../tenders/tenders.service';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private tendersService: TendersService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all organizations (public)' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.id, createOrganizationDto);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my organizations' })
  @ApiResponse({ status: 200, description: 'List of user organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMy(@CurrentUser() user: CurrentUserData) {
    return this.organizationsService.findByUserId(user.id);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get an organization by ID (public)' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, user.id, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owner or admin can delete' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.organizationsService.delete(id, user.id, user.role);
  }

  @Get(':id/quota')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get organization quota information' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization quota details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getQuota(@Param('id') id: string) {
    return this.organizationsService.getQuota(id);
  }

  // Secondary accounts
  @Post(':id/secondary-accounts')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invite a secondary account to organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  inviteSecondaryAccount(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() inviteDto: InviteSecondaryAccountDto,
  ) {
    return this.organizationsService.inviteSecondaryAccount(id, user.id, inviteDto.email);
  }

  @Get(':id/secondary-accounts')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get secondary accounts for an organization' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'List of secondary accounts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSecondaryAccounts(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.organizationsService.getSecondaryAccounts(id, user.id);
  }

  @Post('secondary-accounts/accept/:token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Accept secondary account invitation' })
  @ApiParam({ name: 'token', description: 'Invitation token' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invalid token' })
  acceptInvitation(
    @Param('token') token: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.organizationsService.acceptInvitation(token, user.id);
  }

  @Get('my/tenders')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tenders for current user' })
  @ApiResponse({ status: 200, description: 'List of tenders for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyTenders(@CurrentUser() user: CurrentUserData) {
    return this.tendersService.findByUserId(user.id);
  }

  @Get('tenders/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a tender by ID' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 200, description: 'Tender details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  getTenderById(@Param('id') id: string) {
    return this.tendersService.findOne(id, false);
  }
}


