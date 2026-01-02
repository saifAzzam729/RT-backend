import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
  const nodeEnv = configService.get('nodeEnv') || 'development';
  const frontendUrl = configService.get('frontendUrl') || 'https://rt-syr.com';
  console.log('frontendUrl', frontendUrl);
  // In development, allow multiple localhost origins
  const allowedOrigins = nodeEnv === 'development'
    ? [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173', // Vite default
        'http://localhost:5174',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:5173',
        'https://rt-syr.com',
      ]
    : [frontendUrl];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      // In development, allow all localhost origins
      if (nodeEnv === 'development') {
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (isLocalhost || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      }
      
      // In production, only allow configured origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
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

  // Swagger configuration with error handling
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
    console.log('✅ Swagger documentation setup successfully');
  } catch (error) {
    console.error('❌ Failed to setup Swagger:', error);
    // Continue without Swagger if it fails
  }

  const port = configService.get('port');
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
