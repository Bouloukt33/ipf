import { Test, TestingModule } from '@nestjs/testing';
import { PacksController } from './packs.controller';
import { PacksService } from './packs.service';

describe('PacksController', () => {
  let controller: PacksController;

  const mockPacksService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
  };

  const reqWith = (user: Record<string, unknown> | undefined) => ({ user });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacksController],
      providers: [{ provide: PacksService, useValue: mockPacksService }],
    }).compile();

    controller = module.get<PacksController>(PacksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll — élévation admin', () => {
    it('should keep the visibility filter for a regular user', async () => {
      await controller.findAll(
        reqWith({ userId: 'auth0|user', permissions: [] }),
      );

      expect(mockPacksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ auth0Id: 'auth0|user', isAdmin: false }),
      );
    });

    it('should ignore the roles claim — only permissions count', async () => {
      // Un token qui prétend au rôle admin mais sans la permission serveur
      await controller.findAll(
        reqWith({ userId: 'auth0|user', permissions: [], roles: ['admin'] }),
        undefined,
        undefined,
        undefined,
        undefined,
        'admin',
      );

      expect(mockPacksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
    });

    it('should not widen for an admin without scope=admin (app apprenant)', async () => {
      await controller.findAll(
        reqWith({ userId: 'auth0|admin', permissions: ['write:questions'] }),
      );

      expect(mockPacksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
    });

    it('should widen with scope=admin + write:questions', async () => {
      await controller.findAll(
        reqWith({ userId: 'auth0|admin', permissions: ['write:questions'] }),
        undefined,
        undefined,
        undefined,
        'true',
        'admin',
      );

      expect(mockPacksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true, includeInactive: true }),
      );
    });

    it('should only honor includeInactive in admin view', async () => {
      await controller.findAll(
        reqWith({ userId: 'auth0|user', permissions: [] }),
        undefined,
        undefined,
        undefined,
        'true',
      );

      expect(mockPacksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ includeInactive: false }),
      );
    });
  });

  describe('findOne / findBySlug — contexte viewer', () => {
    it('should pass the viewer to findOne', async () => {
      await controller.findOne(
        reqWith({ userId: 'auth0|user', permissions: [] }),
        'pack-1',
      );

      expect(mockPacksService.findOne).toHaveBeenCalledWith('pack-1', {
        auth0Id: 'auth0|user',
        isAdmin: false,
      });
    });

    it('should pass an admin viewer to findBySlug', async () => {
      await controller.findBySlug(
        reqWith({ userId: 'auth0|admin', permissions: ['write:questions'] }),
        'bail-commercial',
        'decouverte',
      );

      expect(mockPacksService.findBySlug).toHaveBeenCalledWith(
        'bail-commercial',
        'decouverte',
        { auth0Id: 'auth0|admin', isAdmin: true },
      );
    });
  });
});
