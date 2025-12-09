import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from '../dist/src/app.module';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    
    // Serve static files from uploads directory (only if directory exists)
    // In serverless environments like Vercel, this directory may not exist
    try {
      const storagePath = configService.get<string>('storage.path') || join(process.cwd(), 'uploads');
      // Resolve absolute path if relative
      const absoluteStoragePath = storagePath.startsWith('/') 
        ? storagePath 
        : join(process.cwd(), storagePath);
      
      // Only serve static assets if directory exists
      if (existsSync(absoluteStoragePath)) {
        app.useStaticAssets(absoluteStoragePath, {
          prefix: '/api/storage/',
        });
      }
    } catch (error) {
      // Silently fail if static assets can't be set up (common in serverless)
      console.warn('Static assets directory not available:', error.message);
    }

    // Enable CORS
    app.enableCors({
      origin: configService.get('frontendUrl'),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    // Swagger configuration
    try {
      const config = new DocumentBuilder()
        .setTitle('RT Backend API')
        .setDescription('API documentation for RT Backend application')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Enter JWT token',
            in: 'header',
          },
          'JWT-auth',
        )
        .addTag('app', 'General endpoints (stats, search)')
        .addTag('auth', 'Authentication endpoints')
        .addTag('applications', 'Job and Tender applications')
        .addTag('jobs', 'Job management')
        .addTag('tenders', 'Tender management')
        .addTag('companies', 'Company management')
        .addTag('organizations', 'Organization management')
        .addTag('profiles', 'User profile management')
        .addTag('reports', 'Report management')
        .addTag('storage', 'File storage')
        .addTag('admin', 'Admin operations')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
          persistAuthorization: true,
        },
      });
    } catch (error) {
      console.error('Failed to setup Swagger:', error);
      // Continue without Swagger if it fails
    }

    await app.init();
  }
  return app;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
  const appInstance = await bootstrap();
  const handler = appInstance.getHttpAdapter().getInstance();
  return handler(req, res);
};
