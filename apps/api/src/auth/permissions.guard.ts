import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // DEBUG: log JWT payload to diagnose 403
    console.log('[PermissionsGuard] user:', JSON.stringify(user, null, 2));
    console.log('[PermissionsGuard] required:', requiredPermissions);

    if (!user || !user.permissions) {
      throw new ForbiddenException('Permissions insuffisantes — pas de user ou permissions dans le token');
    }

    const hasPermission = requiredPermissions.every((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permissions insuffisantes — requis: [${requiredPermissions}], reçu: [${user.permissions}]`,
      );
    }

    return true;
  }
}
