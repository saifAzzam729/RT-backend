import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../dist/src/app.module';

let app: NestExpressApplication;
let handler: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // Enable CORS
    app.enableCors({
      origin: configService.get('frontendUrl') || '*',
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

    // No global prefix - Vercel routes /api/* to this function
    app.setGlobalPrefix('');

    // Swagger docs (accessible at: /api/docs)
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
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    await app.init();
    handler = app.getHttpAdapter().getInstance();
  }
  return handler;
}

export default async function handlerFunc(req: any, res: any) {
  try {
    const expressHandler = await bootstrap();
    return expressHandler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred',
      });
    }
  }
}
