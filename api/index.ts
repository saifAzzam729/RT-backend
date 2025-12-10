import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from '../dist/src/app.module';

let app: NestExpressApplication;
let handler: any;

async function bootstrap() {
  if (!app) {
    try {
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

      // Enable CORS - allow all origins in serverless if frontendUrl is not set
      const frontendUrl = configService.get('frontendUrl') || '*';
      app.enableCors({
        origin: frontendUrl === '*' ? true : frontendUrl,
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

      // In Vercel, requests to /api/* are routed to this function
      // The path in req.url is relative to /api, so /api/docs becomes /docs
      // Therefore, we don't add the 'api' prefix here
      // app.setGlobalPrefix('api');

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
        // In serverless, path is relative to /api, so /docs not /api/docs
        SwaggerModule.setup('docs', app, document, {
          swaggerOptions: {
            persistAuthorization: true,
          },
        });
      } catch (error) {
        console.error('Failed to setup Swagger:', error);
        // Continue without Swagger if it fails
      }

      await app.init();
      handler = app.getHttpAdapter().getInstance();
    } catch (error) {
      console.error('Failed to bootstrap NestJS application:', error);
      throw error;
    }
  }
  return handler;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
  try {
    console.log('Request received:', req.method, req.url);
    const expressHandler = await bootstrap();
    if (!expressHandler) {
      throw new Error('Express handler not initialized');
    }
    return expressHandler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
};
