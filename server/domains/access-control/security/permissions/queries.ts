import 'server-only';
import { cache } from 'react';


import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

import { permissionsRepository } from './repository';
import { getMenusByPermission } from '../../navigation/menu_permissions';
import { getRolesByPermission } from '../role_permissions';
import { getUsersByPermission } from '../user_permission';

// --- Permissions Queries ---------------------------------------------------------

export const getPermissions = cache((params?: ListParams) =>
  permissionsRepository.list(params)
);

export const getPermissionById = cache((id: string | number) =>
  permissionsRepository.getById(id)
);


// --- Composite Queries (BFF patterns) -------------------------------------------

// Get permission with all relationships
export const getPermissionProfile = cache(async (permissionId: string | number) => {
  const [permission, menus, roles, users] = await Promise.all([
    getPermissionById(permissionId),
    getMenusByPermission(permissionId),
    getRolesByPermission(permissionId),
    getUsersByPermission(permissionId)
  ]);

  return {
    permission,
    menus,
    roles,
    users
  };
});

// Get permission usage statistics
export const getPermissionUsageStats = cache(async (permissionId: string | number) => {
  const [menus, roles, users] = await Promise.all([
    getMenusByPermission(permissionId),
    getRolesByPermission(permissionId),
    getUsersByPermission(permissionId)
  ]);

  return {
    menu_count: menus.length,
    role_count: roles.length,
    user_count: users.length,
    total_usage: menus.length + roles.length + users.length
  };
});

// Get all permissions with their relationships
export const getPermissionsWithUsage = cache(async (params?: ListParams) => {
  const permissions = await getPermissions(params);

  // For each permission, get usage stats (this could be optimized with batch queries)
  const permissionsWithStats = await Promise.all(
    permissions.data.map(async (permission) => {
      const stats = await getPermissionUsageStats(permission.id);
      return {
        ...permission,
        usage_stats: stats
      };
    })
  );

  return {
    ...permissions,
    data: permissionsWithStats
  };
});
