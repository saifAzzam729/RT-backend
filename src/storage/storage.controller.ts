import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { StorageService } from './storage.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';

@ApiTags('storage')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post('license')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload license file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'License uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadLicense(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const url = await this.storageService.uploadLicense(user.id, file);

    return {
      message: 'License uploaded successfully',
      url,
    };
  }

  @Post('resume')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload resume file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resume uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadResume(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const url = await this.storageService.uploadResume(user.id, file);

    return {
      message: 'Resume uploaded successfully',
      url,
    };
  }

  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload logo file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadLogo(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    // Use user.id as entity ID for now, can be customized per use case
    const url = await this.storageService.uploadLogo(user.id, file);

    return {
      message: 'Logo uploaded successfully',
      url,
    };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload avatar file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(
    @CurrentUser() user: CurrentUserData,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const url = await this.storageService.uploadAvatar(user.id, file);

    return {
      message: 'Avatar uploaded successfully',
      url,
    };
  }
}


