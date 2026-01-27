import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no permissions are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockExecutionContext();
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:quiz']);

    const user = {
      userId: 'user-1',
      permissions: ['read:quiz', 'read:profile'],
    };

    const context = createMockExecutionContext(user);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access when user has all required permissions', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['read:quiz', 'write:profile']);

    const user = {
      userId: 'user-1',
      permissions: ['read:quiz', 'write:profile', 'read:profile'],
    };

    const context = createMockExecutionContext(user);
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user lacks required permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['write:admin']);

    const user = {
      userId: 'user-1',
      permissions: ['read:quiz', 'read:profile'],
    };

    const context = createMockExecutionContext(user);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user has no permissions', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:quiz']);

    const user = {
      userId: 'user-1',
    };

    const context = createMockExecutionContext(user);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when no user in request', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['read:quiz']);

    const context = createMockExecutionContext();

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
