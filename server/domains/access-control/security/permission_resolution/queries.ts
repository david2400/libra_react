import 'server-only';
import { cache } from 'react';

import { permission_resolution_repository } from './repository';
import type { 
  IPermission,
  IEffectivePermission
} from './types';

// --- IPermission Resolution Queries ---------------------------------------------

// Get effective permissions (combined user + role permissions)
export const get_effective_permissions = cache((userId: number) => 
  permission_resolution_repository.get_effective_permissions(userId)
);

// Get direct user permissions
export const get_user_permissions = cache((userId: number) => 
  permission_resolution_repository.get_user_permissions(userId)
);

// Get role-based permissions
export const get_role_permissions = cache((userId: number) => 
  permission_resolution_repository.get_role_permissions(userId)
);

// Check if user has a specific permission
export const has_permission = cache((userId: number, permissionCode: string, requiredLevel: string) => 
  permission_resolution_repository.has_permission(userId, permissionCode, requiredLevel)
);

// Check if user has any of the specified permissions
export const has_any_permission = (userId: number, permissionCodes: string[]) => 
  permission_resolution_repository.has_any_permission(userId, permissionCodes);

// Check if user has all of the specified permissions
export const has_all_permissions = (userId: number, permissionCodes: string[]) => 
  permission_resolution_repository.has_all_permissions(userId, permissionCodes);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get complete permission profile for a user
export const get_user_permission_profile = cache(async (userId: number) => {
  const [effectivePermissions, userPermissions, rolePermissions] = await Promise.all([
    get_effective_permissions(userId),
    get_user_permissions(userId),
    get_role_permissions(userId)
  ]);
  
  return {
    userId,
    effectivePermissions,
    directPermissions: userPermissions,
    roleBasedPermissions: rolePermissions,
    summary: {
      totalEffective: effectivePermissions.length,
      directCount: userPermissions.length,
      roleBasedCount: rolePermissions.length
    }
  };
});

// Check multiple permissions at once
export const check_multiple_permissions = cache(async (userId: number, permissionChecks: Array<{ code: string; level: string }>) => {
  const results = await Promise.all(
    permissionChecks.map(async ({ code, level }) => ({
      permissionCode: code,
      requiredLevel: level,
      hasPermission: await has_permission(userId, code, level)
    }))
  );
  
  return {
    userId,
    checks: results,
    allGranted: results.every(r => r.hasPermission),
    anyGranted: results.some(r => r.hasPermission)
  };
});
