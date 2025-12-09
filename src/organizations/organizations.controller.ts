import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteSecondaryAccountDto } from './dto/invite-secondary-account.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
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
  @ApiOperation({ summary: 'Get my organizations' })
  @ApiResponse({ status: 200, description: 'List of user organizations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMy(@CurrentUser() user: CurrentUserData) {
    return this.organizationsService.findByUserId(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
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

  @Get(':id/quota')
  @ApiOperation({ summary: 'Get organization quota information' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization quota details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  getQuota(@Param('id') id: string) {
    return this.organizationsService.getQuota(id);
  }

  // Secondary accounts
  @Post(':id/secondary-accounts')
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
}


