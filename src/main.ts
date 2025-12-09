import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Serve static files from uploads directory
  const storagePath = configService.get<string>('storage.path') || join(process.cwd(), 'uploads');
  // Resolve absolute path if relative
  const absoluteStoragePath = storagePath.startsWith('/') 
    ? storagePath 
    : join(process.cwd(), storagePath);
  app.useStaticAssets(absoluteStoragePath, {
    prefix: '/api/storage/',
  });

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

  const port = configService.get('port');
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
