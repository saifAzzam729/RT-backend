import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { FooterContentDto } from './dto/footer-content.dto';
import { FormConfigDto } from './dto/form-config.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all content' })
  @ApiQuery({ name: 'section', required: false, enum: ['home', 'footer', 'form', 'general'], description: 'Filter by section' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Filter by language (default: en)' })
  @ApiResponse({ status: 200, description: 'List of content items' })
  findAll(
    @Query('section') section?: string,
    @Query('language') language?: string,
  ) {
    return this.contentService.findAll(section, language);
  }

  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Get content by key' })
  @ApiParam({ name: 'key', description: 'Content key' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Content details' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  findByKey(
    @Param('key') key: string,
    @Query('language') language?: string,
  ) {
    return this.contentService.findByKey(key, language || 'en');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create content (Admin only)' })
  @ApiResponse({ status: 201, description: 'Content created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 409, description: 'Content already exists' })
  create(@Body() createContentDto: CreateContentDto) {
    return this.contentService.create(createContentDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Put(':key')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update content by key (Admin only)' })
  @ApiParam({ name: 'key', description: 'Content key' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Content updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  update(
    @Param('key') key: string,
    @Query('language') language: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return this.contentService.update(key, language || 'en', updateContentDto);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Delete(':key')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete content by key (Admin only)' })
  @ApiParam({ name: 'key', description: 'Content key' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  delete(
    @Param('key') key: string,
    @Query('language') language?: string,
  ) {
    return this.contentService.delete(key, language || 'en');
  }

  @Public()
  @Get('footer')
  @ApiOperation({ summary: 'Get footer content' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Footer content' })
  getFooterContent(@Query('language') language?: string) {
    return this.contentService.getFooterContent(language || 'en');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Put('footer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update footer content (Admin only)' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Footer content updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  updateFooterContent(
    @Query('language') language: string,
    @Body() footerContentDto: FooterContentDto,
  ) {
    return this.contentService.updateFooterContent(language || 'en', footerContentDto);
  }

  @Public()
  @Get('form/:formType')
  @ApiOperation({ summary: 'Get form configuration' })
  @ApiParam({ name: 'formType', enum: ['registration', 'job', 'tender'], description: 'Form type' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Form configuration' })
  @ApiResponse({ status: 404, description: 'Form configuration not found' })
  getFormConfig(
    @Param('formType') formType: string,
    @Query('language') language?: string,
  ) {
    return this.contentService.getFormConfig(formType, language || 'en');
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @Put('form/:formType')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update form configuration (Admin only)' })
  @ApiParam({ name: 'formType', enum: ['registration', 'job', 'tender'], description: 'Form type' })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'ar'], description: 'Content language (default: en)' })
  @ApiResponse({ status: 200, description: 'Form configuration updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Form type mismatch' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  updateFormConfig(
    @Param('formType') formType: string,
    @Query('language') language: string,
    @Body() formConfigDto: FormConfigDto,
  ) {
    return this.contentService.updateFormConfig(formType, language || 'en', formConfigDto);
  }
}
