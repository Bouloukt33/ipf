import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configuration identique à main.ts
    app.enableCors({
      origin: ['http://localhost:5173', 'http://localhost:3001'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Routes', () => {
    it('/ (GET) - Health check', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Protected Routes - Without Token', () => {
    it('/api/protected (GET) - Should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/protected')
        .expect(401);
    });

    it('/api/profile (GET) - Should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/profile')
        .expect(401);
    });

    it('/api/admin (GET) - Should return 401 Unauthorized', () => {
      return request(app.getHttpServer())
        .get('/api/admin/dashboard')
        .expect(401);
    });
  });
});
