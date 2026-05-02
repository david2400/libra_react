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

export const getRoles = cache((params?: ListParams) => 
  rolesRepository.list(params)
);

export const getRoleById = cache((id: string | number) => 
  rolesRepository.getById(id)
);

// Composite query: Get role with permissions and menus
export const getRoleWithDetails = cache(async (id: string | number) => {
  const role = await getRoleById(id);
  return role;
});

// --- IRole-IMenu Relationships Queries -----------------------------------------

export const getRoleMenus = cache((params?: ListParams) => 
  roleMenusRepository.list(params)
);

export const getRoleMenuById = cache((roleId: string | number, menuId: string | number) => 
  roleMenusRepository.getById(roleId, menuId)
);

export const getMenusByRole = cache((roleId: string | number) => 
  roleMenusRepository.getMenusByRole(roleId)
);

export const getRoleByMenu = cache((menuId: string | number) => 
  roleMenusRepository.getRoleByMenu(menuId)
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

export const getRoleByPermission = cache((permissionId: string | number) => 
  rolePermissionsRepository.getRoleByPermission(permissionId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get role with all permissions and menus
export const getRoleProfile = cache(async (roleId: string | number) => {
  const [role, roleMenus, rolePermissions] = await Promise.all([
    getRoleById(roleId),
    getMenusByRole(roleId),
    getRolePermissions({ params: { roleId } })
  ]);
  
  return {
    role,
    menus: roleMenus,
    permissions: rolePermissions.data
  };
});

// Get complete role access profile
export const getRoleAccessProfile = cache(async (roleId: string | number) => {
  const [role, roleMenus, rolePermissions] = await Promise.all([
    getRoleById(roleId),
    getMenusByRole(roleId),
    getPermissionsByRole(roleId)
  ]);
  
  return {
    role,
    menus: roleMenus,
    permissions: rolePermissions
  };
});
