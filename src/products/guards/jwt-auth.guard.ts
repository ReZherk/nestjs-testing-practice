import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Simulated JWT validation - in real app, verify JWT token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (token !== 'valid-token') {
      throw new UnauthorizedException('Invalid token');
    }

    // Attach user info to request for use in controllers/guards
    request.user = { id: 1, username: 'testuser', roles: ['admin'] };
    return true;
  }
}
