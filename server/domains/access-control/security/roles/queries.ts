import 'server-only';
import { cache } from 'react';

import { 
  rolesRepository, 
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import { getPermissionsByRole, getRolePermissions, rolePermissionsRepository } from '../role_permissions';
import { getMenusByRole } from '../../navigation/role_menus';

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
    permissions: rolePermissions.content
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
