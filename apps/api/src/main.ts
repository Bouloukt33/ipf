import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' 
      ? ['error', 'warn'] 
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Configuration CORS pour autoriser les requêtes depuis les frontends
  app.enableCors({
    origin: [
      'http://localhost:3001', // web-app (Next.js)
      'http://localhost:5173', // web-admin (Vite)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  // Configuration Swagger (désactivé en production)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('IPF - 5 Secondes Chrono API')
      .setDescription('Documentation de l\'API du jeu 5 Secondes Chrono')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 API running on port ${port}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
