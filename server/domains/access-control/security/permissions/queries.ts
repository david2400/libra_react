import 'server-only';
import { cache } from 'react';

import { 
  permissionsRepository, 
  menuPermissionsRepository,
  rolePermissionsRepository,
  user_permissions_repository
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

export const get_permissions = cache((params?: ListParams) => 
  permissionsRepository.list(params)
);

export const get_permission_by_id = cache((id: string | number) => 
  permissionsRepository.getById(id)
);

// --- IMenu-IPermission Relationships Queries ---------------------------------

export const get_menu_permissions = cache((params?: ListParams) => 
  menuPermissionsRepository.list(params)
);

export const get_menu_permission_by_id = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionsRepository.getById(menuId, permissionId)
);

export const get_permissions_by_menu = cache((menuId: string | number) => 
  menuPermissionsRepository.get_permissions_by_menu(menuId)
);

export const get_menus_by_permission = cache((permissionId: string | number) => 
  menuPermissionsRepository.get_menus_by_permission(permissionId)
);

// --- IRole-IPermission Relationships Queries -----------------------------------

export const get_role_permissions = cache((params?: ListParams) => 
  rolePermissionsRepository.list(params)
);

export const get_role_permission_by_id = cache((roleId: string | number, permissionId: string | number) => 
  rolePermissionsRepository.getById(roleId, permissionId)
);

export const get_permissions_by_role = cache((roleId: string | number) => 
  rolePermissionsRepository.get_permissions_by_role(roleId)
);

export const get_roles_by_permission = cache((permissionId: string | number) => 
  rolePermissionsRepository.get_roles_by_permission(permissionId)
);

// --- IUser-IPermission Relationships Queries -----------------------------------

export const get_user_permissions = cache((params?: ListParams) => 
  user_permissions_repository.list(params)
);

export const get_user_permission_by_id = cache((userId: string | number, permissionId: string | number) => 
  user_permissions_repository.getById(userId, permissionId)
);

export const get_permissions_by_user = cache((userId: string | number) => 
  user_permissions_repository.get_permissions_by_user(userId)
);

export const get_users_by_permission = cache((permissionId: string | number) => 
  user_permissions_repository.get_users_by_permission(permissionId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get permission with all relationships
export const get_permission_profile = cache(async (permissionId: string | number) => {
  const [permission, menus, roles, users] = await Promise.all([
    get_permission_by_id(permissionId),
    get_menus_by_permission(permissionId),
    get_roles_by_permission(permissionId),
    get_users_by_permission(permissionId)
  ]);
  
  return {
    permission,
    menus,
    roles,
    users
  };
});

// Get permission usage statistics
export const get_permission_usage_stats = cache(async (permissionId: string | number) => {
  const [menus, roles, users] = await Promise.all([
    get_menus_by_permission(permissionId),
    get_roles_by_permission(permissionId),
    get_users_by_permission(permissionId)
  ]);
  
  return {
    menu_count: menus.length,
    role_count: roles.length,
    user_count: users.length,
    total_usage: menus.length + roles.length + users.length
  };
});

// Get all permissions with their relationships
export const get_permissions_with_usage = cache(async (params?: ListParams) => {
  const permissions = await get_permissions(params);
  
  // For each permission, get usage stats (this could be optimized with batch queries)
  const permissionsWithStats = await Promise.all(
    permissions.data.map(async (permission) => {
      const stats = await get_permission_usage_stats(permission.id);
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
