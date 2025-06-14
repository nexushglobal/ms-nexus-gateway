import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const ROLE_CODES = {
  SYSTEM: 'SYS',
  ADMIN: 'ADM',
  BILLING: 'FAC',
  CLIENT: 'CLI',
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];
