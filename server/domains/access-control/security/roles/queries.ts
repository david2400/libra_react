import 'server-only';
import { cache } from 'react';

import { 
  rolesRepository, 
  roleMenusRepository,
  rolePermissionsRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IRole, 
  IPermission,
  IMenu,
  IRoleMenu,
  IRolePermission
} from './types';

// --- Roles Queries -----------------------------------------------------------

export const get_roles = cache((params?: ListParams) => 
  rolesRepository.list(params)
);

export const get_role_by_id = cache((id: string | number) => 
  rolesRepository.getById(id)
);

// Composite query: Get role with permissions and menus
export const get_role_with_details = cache(async (id: string | number) => {
  const role = await get_role_by_id(id);
  return role;
});

// --- IRole-IMenu Relationships Queries -----------------------------------------

export const get_role_menus = cache((params?: ListParams) => 
  roleMenusRepository.list(params)
);

export const get_role_menu_by_id = cache((roleId: string | number, menuId: string | number) => 
  roleMenusRepository.getById(roleId, menuId)
);

export const get_menus_by_role = cache((roleId: string | number) => 
  roleMenusRepository.get_menus_by_role(roleId)
);

export const get_role_by_menu = cache((menuId: string | number) => 
  roleMenusRepository.get_role_by_menu(menuId)
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

export const get_role_by_permission = cache((permissionId: string | number) => 
  rolePermissionsRepository.get_role_by_permission(permissionId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get role with all permissions and menus
export const get_role_profile = cache(async (roleId: string | number) => {
  const [role, roleMenus, rolePermissions] = await Promise.all([
    get_role_by_id(roleId),
    get_menus_by_role(roleId),
    get_role_permissions({ params: { roleId } })
  ]);
  
  return {
    role,
    menus: roleMenus,
    permissions: rolePermissions.data
  };
});

// Get complete role access profile
export const get_role_access_profile = cache(async (roleId: string | number) => {
  const [role, roleMenus, rolePermissions] = await Promise.all([
    get_role_by_id(roleId),
    get_menus_by_role(roleId),
    get_permissions_by_role(roleId)
  ]);
  
  return {
    role,
    menus: roleMenus,
    permissions: rolePermissions
  };
});
