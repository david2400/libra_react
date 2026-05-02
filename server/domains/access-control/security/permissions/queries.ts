import 'server-only';
import { cache } from 'react';

import { 
  permissionsRepository, 
  menuPermissionsRepository,
  rolePermissionsRepository,
  userPermissionsRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IPermission, 
  IMenu,
  IRole,
  IUser,
  IMenuPermission,
  IRolePermission,
  IUserPermission
} from './types';

// --- Permissions Queries ---------------------------------------------------------

export const getPermissions = cache((params?: ListParams) => 
  permissionsRepository.list(params)
);

export const getPermissionById = cache((id: string | number) => 
  permissionsRepository.getById(id)
);

// --- IMenu-IPermission Relationships Queries ---------------------------------

export const getMenuPermissions = cache((params?: ListParams) => 
  menuPermissionsRepository.list(params)
);

export const getMenuPermissionById = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionsRepository.getById(menuId, permissionId)
);

export const getPermissionsByMenu = cache((menuId: string | number) => 
  menuPermissionsRepository.getPermissionsByMenu(menuId)
);

export const getMenusByPermission = cache((permissionId: string | number) => 
  menuPermissionsRepository.getMenusByPermission(permissionId)
);

// --- IRole-IPermission Relationships Queries -----------------------------------

export const getRolePermissions = cache((params?: ListParams) => 
  rolePermissionsRepository.list(params)
);

export const getRolePermissionById = cache((roleId: string | number, permissionId: string | number) => 
  rolePermissionsRepository.getById(roleId, permissionId)
);

export const getPermissionsByRole = cache((roleId: string | number) => 
  rolePermissionsRepository.getPermissionsByRole(roleId)
);

export const getRolesByPermission = cache((permissionId: string | number) => 
  rolePermissionsRepository.getRolesByPermission(permissionId)
);

// --- IUser-IPermission Relationships Queries -----------------------------------

export const getUserPermissions = cache((params?: ListParams) => 
  userPermissionsRepository.list(params)
);

export const getUserPermissionById = cache((userId: string | number, permissionId: string | number) => 
  userPermissionsRepository.getById(userId, permissionId)
);

export const getPermissionsByUser = cache((userId: string | number) => 
  userPermissionsRepository.getPermissionsByUser(userId)
);

export const getUsersByPermission = cache((permissionId: string | number) => 
  userPermissionsRepository.getUsersByPermission(permissionId)
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
