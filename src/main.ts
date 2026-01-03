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

  // Serve static files from uploads directory (only if it exists)
  const storagePath = configService.get<string>('storage.path') || join(process.cwd(), 'uploads');
  const absoluteStoragePath = storagePath.startsWith('/') ? storagePath : join(process.cwd(), storagePath);
  if (existsSync(absoluteStoragePath)) {
    app.useStaticAssets(absoluteStoragePath, {
      prefix: '/api/storage/',
    });
  }

  // CORS setup
  const nodeEnv = configService.get('nodeEnv') || 'production';
  const frontendUrl = configService.get('frontendUrl') || 'https://rt-syr.com';

  const allowedOrigins = nodeEnv === 'development'
    ? [
        frontendUrl,
        'http://localhost:3000',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
      ]
    : [frontendUrl]; // Production: allow only your frontend domain

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps)
      if (!origin) return callback(null, true);

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

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  try {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('RT Backend API')
      .setDescription('API documentation for RT Backend application')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
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

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
    console.log('✅ Swagger documentation setup successfully');
  } catch (error) {
    console.error('❌ Failed to setup Swagger:', error);
  }

  const port = configService.get<number>('port') || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running at: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
