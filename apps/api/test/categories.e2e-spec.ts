import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Public Routes - Categories', () => {
    let categoryId: string;
    let categorySlug: string;

    beforeAll(async () => {
      // Créer une catégorie de test
      const category = await prisma.category.create({
        data: {
          name: 'Test Category E2E',
          slug: 'test-category-e2e',
          description: 'Category for E2E testing',
          isActive: true,
          order: 1,
        },
      });
      categoryId = category.id;
      categorySlug = category.slug;
    });

    afterAll(async () => {
      // Nettoyer
      await prisma.category.delete({ where: { id: categoryId } });
    });

    it('/api/categories (GET) - Should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/categories')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/api/categories/:id (GET) - Should return category by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(categoryId);
          expect(res.body.name).toBe('Test Category E2E');
        });
    });

    it('/api/categories/slug/:slug (GET) - Should return category by slug', () => {
      return request(app.getHttpServer())
        .get(`/api/categories/slug/${categorySlug}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.slug).toBe(categorySlug);
          expect(res.body.name).toBe('Test Category E2E');
        });
    });

    it('/api/categories/:id (GET) - Should return 404 for non-existent category', () => {
      return request(app.getHttpServer())
        .get('/api/categories/non-existent-id')
        .expect(404);
    });
  });
});
