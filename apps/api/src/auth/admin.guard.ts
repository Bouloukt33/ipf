import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const roles = Array.isArray(user?.roles) ? user.roles : [];
    const normalized = roles.map((role: string) => role.toUpperCase());

    if (!normalized.includes('ADMIN')) {
      throw new ForbiddenException('Acces admin requis');
    }

    return true;
  }
}
