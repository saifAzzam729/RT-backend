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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TendersService } from './tenders.service';
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { QueryTendersDto } from './dto/query-tenders.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('tenders')
@Controller('tenders')
export class TendersController {
  constructor(private tendersService: TendersService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.company, UserRole.organization)
  @ApiOperation({ summary: 'Create a new tender (company/organization only)' })
  @ApiResponse({ status: 201, description: 'Tender created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Company or Organization role required' })
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTenderDto: CreateTenderDto,
  ) {
    return this.tendersService.create(user.id, createTenderDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tenders (public)' })
  @ApiResponse({ status: 200, description: 'List of tenders' })
  findAll(@Query() queryDto: QueryTendersDto) {
    return this.tendersService.findAll(queryDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a tender by ID (public)' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 200, description: 'Tender details' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  findOne(@Param('id') id: string) {
    return this.tendersService.findOne(id, true);
  }

  @Get('id/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a tender by ID (authenticated)' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 200, description: 'Tender details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  findOneAuthenticated(@Param('id') id: string) {
    return this.tendersService.findOne(id, false);
  }

  @Get('organization/:organizationId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tenders by organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'List of tenders for the organization' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByOrganization(@Param('organizationId') organizationId: string) {
    return this.tendersService.findByOrganization(organizationId);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tenders for current user' })
  @ApiResponse({ status: 200, description: 'List of tenders for the current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMy(@CurrentUser() user: CurrentUserData) {
    return this.tendersService.findByUserId(user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a tender' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 200, description: 'Tender updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
    @Body() updateTenderDto: UpdateTenderDto,
  ) {
    return this.tendersService.update(id, user.id, updateTenderDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a tender' })
  @ApiParam({ name: 'id', description: 'Tender ID' })
  @ApiResponse({ status: 200, description: 'Tender deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tender not found' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.tendersService.remove(id, user.id);
  }
}


