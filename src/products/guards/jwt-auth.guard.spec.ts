import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if no token provided', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    };

    expect(() => guard.canActivate(mockExecutionContext as any)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalid-token' },
        }),
      }),
    };

    expect(() => guard.canActivate(mockExecutionContext as any)).toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request and return true for valid token', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer valid-token' },
      user: undefined,
    };

    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    };

    const result = guard.canActivate(mockExecutionContext as any);

    expect(result).toBe(true);
    expect(mockRequest.user).toEqual({
      id: 1,
      username: 'testuser',
      roles: ['admin'],
    });
  });
});
