import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Décorateur pour spécifier les permissions requises pour une route
 *
 * Exemple d'utilisation:
 * @Permissions('read:users', 'write:users')
 * @Get('users')
 * getUsers() { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
