import type { roles } from '@/server/domains/access-control/security';

export type IRoleCreateRequest = roles.ICreateRolePayload;
export type IRoleUpdateRequest = roles.IUpdateRolePayload & { id: string | number };
export type IRole = roles.IRole;
export type IPermission = roles.IPermission;
export type IMenu = roles.IMenu;
