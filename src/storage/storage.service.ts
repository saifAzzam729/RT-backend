import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private storagePath: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    // Get storage path from config or use default
    const storagePath = this.configService.get<string>('storage.path') || 'uploads';
    // Resolve absolute path if relative
    this.storagePath = storagePath.startsWith('/') 
      ? storagePath 
      : join(process.cwd(), storagePath);
    this.baseUrl = this.configService.get<string>('storage.baseUrl') || '/api/storage';
  }

  async onModuleInit() {
    // Ensure storage directory exists on module initialization
    await this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Create main storage directory
      await fs.mkdir(this.storagePath, { recursive: true });
      
      // Create subdirectories for different file types
      const subdirs = ['licenses', 'resumes', 'logos', 'avatars'];
      for (const subdir of subdirs) {
        const dirPath = join(this.storagePath, subdir);
        await fs.mkdir(dirPath, { recursive: true });
      }
      
      this.logger.log(`Local storage initialized at: ${this.storagePath}`);
    } catch (error) {
      this.logger.error(`Failed to initialize storage directory: ${error}`);
      throw new Error(`Failed to initialize storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(
    category: string,
    path: string,
    file: Express.Multer.File | undefined,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const fullPath = join(this.storagePath, category, path);
      const dir = join(this.storagePath, category);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      // Write file to disk
      await fs.writeFile(fullPath, file.buffer);
      
      this.logger.log(`File uploaded successfully: ${fullPath}`);
      
      // Return public URL
      return this.getPublicUrl(category, path);
    } catch (error) {
      this.logger.error(`Failed to upload file:`, error);
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getPublicUrl(category: string, path: string): string {
    // Return URL that will be served by static file middleware
    return `${this.baseUrl}/${category}/${path}`;
  }

  async deleteFile(category: string, path: string): Promise<void> {
    try {
      const fullPath = join(this.storagePath, category, path);
      await fs.unlink(fullPath);
      this.logger.log(`File deleted successfully: ${fullPath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        // File doesn't exist, that's okay
        this.logger.warn(`File not found for deletion: ${join(this.storagePath, category, path)}`);
        return;
      }
      this.logger.error(`Failed to delete file:`, error);
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Helper methods for specific file types
  async uploadLicense(userId: string, file: Express.Multer.File | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.validateFileType(file, ['application/pdf']);
    this.validateFileSize(file, 5 * 1024 * 1024); // 5MB

    const filename = `${userId}-${Date.now()}.pdf`;
    const path = filename;

    return this.uploadFile('licenses', path, file);
  }

  async uploadResume(userId: string, file: Express.Multer.File | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.validateFileType(file, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
    this.validateFileSize(file, 5 * 1024 * 1024); // 5MB

    const extension = file.originalname.split('.').pop() || 'pdf';
    const filename = `${userId}-${Date.now()}.${extension}`;
    const path = filename;

    return this.uploadFile('resumes', path, file);
  }

  async uploadLogo(entityId: string, file: Express.Multer.File | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
    this.validateFileSize(file, 2 * 1024 * 1024); // 2MB

    const extension = file.originalname.split('.').pop() || 'png';
    const filename = `${entityId}-${Date.now()}.${extension}`;
    const path = filename;

    return this.uploadFile('logos', path, file);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    this.validateFileType(file, ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']);
    this.validateFileSize(file, 2 * 1024 * 1024); // 2MB

    const extension = file.originalname.split('.').pop() || 'png';
    const filename = `${userId}-${Date.now()}.${extension}`;
    const path = filename;

    return this.uploadFile('avatars', path, file);
  }

  private validateFileType(file: Express.Multer.File | undefined, allowedTypes: string[]) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  private validateFileSize(file: Express.Multer.File | undefined, maxSize: number) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      );
    }
  }
}
