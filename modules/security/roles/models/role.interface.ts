import type { roles } from '@/server/domains/access-control/security';

export type IRoleCreateRequest = roles.ICreateRole;
export type IRoleUpdateRequest = roles.IUpdateRole & { id: string | number };
export type IRole = roles.IRole;
