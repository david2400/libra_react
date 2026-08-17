import type { IPermission } from '@/server/domains/access-control/security/permissions';

export type { IPermission };

export type PermissionTargetType = 'role' | 'user';

export interface PermissionTarget {
  type: PermissionTargetType;
  id: number;
}

// Represents the assignment (or potential assignment) of a catalog IPermission
// to either a role or a user, backed by the role_permissions / user_permission
// backend domains (composite key: role_id|user_id + permission_id).
export interface IPermissionAssignment {
  permission_id: number;
  role_id?: number;
  user_id?: number;
  level: string;
  assigned: boolean;
}

