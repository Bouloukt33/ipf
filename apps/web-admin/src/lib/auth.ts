import { jwtDecode } from 'jwt-decode';
import { ENV } from './env';

interface TokenPayload {
  permissions?: string[];
  [key: string]: unknown;
}

export function getRolesFromToken(token: string): string[] {
  const payload = jwtDecode<TokenPayload>(token);
  const rolesClaim = payload[ENV.auth0RoleClaim];
  if (Array.isArray(rolesClaim)) {
    return rolesClaim.map((role) => String(role).trim().toUpperCase());
  }
  return [];
}

export function getPermissionsFromToken(token: string): string[] {
  const payload = jwtDecode<TokenPayload>(token);
  const permissions = payload.permissions || [];
  return permissions.map((permission) => String(permission).trim());
}

export function isAdminToken(token: string) {
  const roles = getRolesFromToken(token);
  if (roles.includes('ADMIN')) return true;

  const permissions = getPermissionsFromToken(token);
  return permissions.includes('read:admin');
}
