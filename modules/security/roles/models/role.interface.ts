import type { roles } from '@/server/domains/access-control/security';
import type { IAuditInfo } from '@/server/lib/types';

export type IRoleCreateRequest = roles.ICreateRole;
export type IRoleUpdateRequest = roles.IUpdateRole;
export type IRole = roles.IRole;
