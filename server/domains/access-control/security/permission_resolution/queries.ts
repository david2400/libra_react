import 'server-only';
import { cache } from 'react';

import { permissionResolutionRepository } from './repository';
import type { 
  IEffectivePermission
} from './types';

// --- IPermission Resolution Queries ---------------------------------------------

// Get effective permissions (combined user + role permissions)
export const getEffectivePermissions = cache((userId: number) => 
  permissionResolutionRepository.getEffectivePermissions(userId)
);

// Get direct user permissions
export const getUserPermissions = cache((userId: number) => 
  permissionResolutionRepository.getUserPermissions(userId)
);

// // Get role-based permissions
export const getRolePermissionsByUser = cache((userId: number) => 
  permissionResolutionRepository.getRolePermissions(userId)
);

// Check if user has a specific permission
export const hasPermission = cache((userId: number, permissionCode: string, requiredLevel: string) => 
  permissionResolutionRepository.hasPermission(userId, permissionCode, requiredLevel)
);

// Check if user has any of the specified permissions
export const hasAnyPermission = (userId: number, permissionCodes: string[]) => 
  permissionResolutionRepository.hasAnyPermission(userId, permissionCodes);

// Check if user has all of the specified permissions
export const hasAllPermissions = (userId: number, permissionCodes: string[]) => 
  permissionResolutionRepository.hasAllPermissions(userId, permissionCodes);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get complete permission profile for a user
export const getUserPermissionProfile = cache(async (userId: number) => {
  const [effectivePermissions, userPermissions, rolePermissions] = await Promise.all([
    getEffectivePermissions(userId),
    getUserPermissions(userId),
    getRolePermissionsByUser(userId)
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
export const checkMultiplePermissions = cache(async (userId: number, permissionChecks: Array<{ code: string; level: string }>) => {
  const results = await Promise.all(
    permissionChecks.map(async ({ code, level }) => ({
      permissionCode: code,
      requiredLevel: level,
      hasPermission: await hasPermission(userId, code, level)
    }))
  );
  
  return {
    userId,
    checks: results,
    allGranted: results.every(r => r.hasPermission),
    anyGranted: results.some(r => r.hasPermission)
  };
});
