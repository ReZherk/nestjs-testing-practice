import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if no roles metadata', () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['admin'] } }),
      }),
      getHandler: () => ({}),
    };

    const result = guard.canActivate(mockExecutionContext as any);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user has no roles', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin']);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: {} }),
      }),
      getHandler: () => ({}),
    };

    expect(() => guard.canActivate(mockExecutionContext as any)).toThrow(
      ForbiddenException,
    );
  });

  it('should return true if user has required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(['admin', 'user']);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['admin'] } }),
      }),
      getHandler: () => ({}),
    };

    const result = guard.canActivate(mockExecutionContext as any);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required role', () => {
    (reflector.get as jest.Mock).mockReturnValue(['superadmin']);

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { roles: ['admin'] } }),
      }),
      getHandler: () => ({}),
    };

    expect(() => guard.canActivate(mockExecutionContext as any)).toThrow(
      ForbiddenException,
    );
  });
});
