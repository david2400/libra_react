import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IEffectivePermission,
  IPermissionCheckRequest,
  IPermissionCheckResponse,
  IHasAnyPermissionRequest,
  IHasAllPermissionsRequest
} from './types';
import type { IPermission } from '../permissions';

// --- IPermission Resolution Repository -----------------------------------------

export const permissionResolutionRepository = {
  // Get effective permissions for a user (combined user + role permissions)
  getEffectivePermissions: (userId: number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/permission-resolution/user/${userId}/effective`, {
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),

  // Get direct user permissions
  getUserPermissions: (userId: number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/permission-resolution/user/${userId}/user-permissions`, {
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),

  // Get role-based permissions for a user
  getRolePermissions: (userId: number) => 
    serverFetch.get<IPermission[]>(`/api/access_control/permission-resolution/user/${userId}/role-permissions`, {
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),

  // Check if user has a specific permission
  hasPermission: (userId: number, permissionCode: string, requiredLevel: string) => 
    serverFetch.get<boolean>(`/api/access_control/permission-resolution/user/${userId}/has-permission`, {
      params: { permissionCode, requiredLevel },
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),

  // Check if user has any of the specified permissions
  hasAnyPermission: (userId: number, permissionCodes: string[]) => 
    serverFetch.post<boolean>(`/api/access_control/permission-resolution/user/${userId}/has-any-permission`, permissionCodes, {
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),

  // Check if user has all of the specified permissions
  hasAllPermissions: (userId: number, permissionCodes: string[]) => 
    serverFetch.post<boolean>(`/api/access_control/permission-resolution/user/${userId}/has-all-permissions`, permissionCodes, {
      revalidate: 60,
      tags: [accessControlTags.user(userId), accessControlTags.permissions()],
    }),
} as const;
