import 'server-only';
import { cache } from 'react';

import { 
  rolePermissionsRepository, 
  rolePermissionStatsRepository,
  rolePermissionBulkRepository,
  rolePermissionValidationRepository,
  rolePermissionActivityRepository,
  rolePermissionInheritanceRepository,
  rolePermissionConflictRepository,
  rolePermissionExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IRolePermission, 
  IRolePermissionStats,
  IRolePermissionOverview,
  IBulkRolePermissionPayload,
  IBulkRolePermissionResponse,
  IRolePermissionValidationResult,
  IRolePermissionValidationRequest,
  IRolePermissionActivity,
  IRolePermissionActivityFilter,
  IRolePermissionExportRequest,
  IRolePermissionExportResponse,
  IRolePermissionInheritanceTree,
  IRolePermissionConflict,
  IRolePermissionConflictResolution,
} from './types';

// --- IRole-IPermission Relationships Queries ---------------------------------

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

export const getActivePermissionsForRole = cache((roleId: string | number) => 
  rolePermissionsRepository.getActivePermissions(roleId)
);

// --- IRole-IPermission Statistics Queries ---------------------------------

export const getRolePermissionStats = cache((roleId: string | number, permissionId: string | number) => 
  rolePermissionStatsRepository.getStats(roleId, permissionId)
);

export const getAllRolePermissionStats = cache(() => 
  rolePermissionStatsRepository.getAllStats()
);

export const getRolePermissionOverview = cache((roleId: string | number, permissionId: string | number) => 
  rolePermissionStatsRepository.getOverview(roleId, permissionId)
);

// --- IRole-IPermission Inheritance Queries ---------------------------------

export const getInheritedPermissionsForRole = cache((roleId: string | number) => 
  rolePermissionInheritanceRepository.get_inherited_permissions(roleId)
);

export const getRolePermissionInheritanceTree = cache((roleId: string | number) => 
  rolePermissionInheritanceRepository.get_inheritance_tree(roleId)
);

// --- IRole-IPermission Activity Queries ---------------------------------

export const getRolePermissionActivities = cache((params?: ListParams) => 
  rolePermissionActivityRepository.list(params)
);

export const getActivitiesByRole = cache((roleId: string | number, params?: ListParams) => 
  rolePermissionActivityRepository.get_by_role(roleId, params)
);

export const getActivitiesByPermission = cache((permissionId: string | number, params?: ListParams) => 
  rolePermissionActivityRepository.get_by_permission(permissionId, params)
);

export const getRecentRolePermissionActivities = cache((roleId: string | number, limit?: number) => 
  rolePermissionActivityRepository.getRecent(roleId, limit)
);

// --- IRole-IPermission Matrix Queries ---------------------------------

// export const get_role_permission_matrix = cache((params?: ListParams) => 
//   role_permission_matrix_repository.get_matrix(params)
// );

// export const get_role_permission_matrix_by_role = cache((roleId: string | number) => 
//   role_permission_matrix_repository.get_matrix_by_role(roleId)
// );

// export const get_role_permission_matrix_by_permission = cache((permissionId: string | number) => 
//   role_permission_matrix_repository.get_matrix_by_permission(permissionId)
// );

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get role with all permission relationships
export const getRoleWithPermissions = cache(async (roleId: string | number) => {
  const [permissions, activePermissions, inheritedPermissions, recentActivities] = await Promise.all([
    getPermissionsByRole(roleId),
    getActivePermissionsForRole(roleId),
    getInheritedPermissionsForRole(roleId),
    getRecentRolePermissionActivities(roleId, 10)
  ]);
  
  return {
    role_id: roleId,
    permissions,
    active_permissions: activePermissions,
    inherited_permissions: inheritedPermissions,
    recent_activities: recentActivities,
    total_permissions: permissions.length,
    active_count: activePermissions.length,
    inherited_count: inheritedPermissions.length
  };
});

// Get permission with all role relationships
export const getPermissionWithRoles = cache(async (permissionId: string | number) => {
  const [roles, recentActivities] = await Promise.all([
    getRolesByPermission(permissionId),
    getActivitiesByPermission(permissionId, { per_page: 10 })
  ]);
  
  return {
    permission_id: permissionId,
    roles,
    recent_activities: recentActivities.data,
    total_roles: roles.length
  };
});

// Get role permission dashboard data
export const getRolePermissionDashboard = cache(async () => {
  const [rolePermissions, allStats] = await Promise.all([
    getRolePermissions({ per_page: 100 }),
    getAllRolePermissionStats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = rolePermissions.data.map(rolePermission => {
    const stats = allStats.find(s => s.role_id === rolePermission.role_id && s.permission_id === rolePermission.permission_id);
    
    return {
      ...rolePermission,
      stats: stats || {
        role_id: rolePermission.role_id,
        permission_id: rolePermission.permission_id,
        usage_count: 0,
        created_at: rolePermission.created_at || ''
      }
    };
  });
  
  return {
    role_permissions: dashboardData,
    summary: {
      total_relationships: rolePermissions.meta.total,
      total_usage: allStats.reduce((sum, s) => sum + s.usage_count, 0),
      active_relationships: dashboardData.filter(rp => rp.is_active).length
    }
  };
});

// Get role permission usage patterns
export const getRolePermissionUsagePatterns = cache(async (roleId: string | number, days: number = 30) => {
  const [permissions, activities, stats] = await Promise.all([
    getPermissionsByRole(roleId),
    getActivitiesByRole(roleId, { per_page: days * 24 }), // Assuming hourly checks
    getAllRolePermissionStats().then(allStats => 
      allStats.filter(s => s.role_id === roleId)
    )
  ]);
  
  // Process usage data
  const usagePatterns = activities.data
    .filter(activity => activity.activity_type === 'permission_used')
    .map(activity => ({
      timestamp: activity.created_at,
      permission_id: activity.permission_id,
      description: activity.description,
      metadata: activity.metadata
    }));
  
  // Group by permission
  const permissionUsagePatterns = permissions.map(permission => {
    const permissionActivities = usagePatterns.filter(up => up.permission_id === permission.id);
    const permissionStats = stats.find(s => s.permission_id === permission.id);
    
    return {
      permission,
      usage_count: permissionActivities.length,
      last_used: permissionActivities.length > 0 ? permissionActivities[0].timestamp : permissionStats?.last_used,
      usage_frequency: permissionActivities.length / days // uses per day
    };
  });
  
  return {
    role_id: roleId,
    patterns: permissionUsagePatterns.sort((a, b) => b.usage_count - a.usage_count),
    summary: {
      total_uses: usagePatterns.length,
      unique_permissions_used: permissionUsagePatterns.filter(p => p.usage_count > 0).length,
      most_used_permission: permissionUsagePatterns[0]?.permission || null
    }
  };
});

// Get role permission inheritance analysis
export const getRolePermissionInheritanceAnalysis = cache(async (roleId: string | number) => {
  const [inheritanceTree, directPermissions] = await Promise.all([
    getRolePermissionInheritanceTree(roleId),
    getPermissionsByRole(roleId)
  ]);
  
  // Analyze inheritance
  const inheritedPermissions = inheritanceTree.inherited_permissions;
  const directPermissionIds = directPermissions.map(p => p.id);
  const inheritedPermissionIds = inheritedPermissions.map(ip => ip.permission.id);
  
  const analysis = {
    direct_permissions: directPermissions.length,
    inherited_permissions: inheritedPermissions.length,
    total_permissions: directPermissions.length + inheritedPermissions.length,
    inheritance_depth: Math.max(0, ...inheritedPermissions.map(ip => ip.inheritance_level)),
    inheritance_sources: inheritedPermissions.reduce((acc, ip) => {
      const sourceId = ip.inherited_from.id;
      if (!acc[sourceId]) {
        acc[sourceId] = 0;
      }
      acc[sourceId]++;
      return acc;
    }, {} as Record<string | number, number>)
  };
  
  return {
    role_id: roleId,
    inheritance_tree: inheritanceTree,
    analysis,
    inheritance_sources: Object.entries(analysis.inheritance_sources).map(([sourceId, count]) => ({
      role_id: sourceId,
      inherited_count: count
    }))
  };
});

// Get role permission conflict analysis
export const getRolePermissionConflictAnalysis = cache(async (roleId: string | number) => {
  const [conflicts] = await Promise.all([
    rolePermissionConflictRepository.detect_conflicts(roleId)
  ]);
  
  // Analyze conflicts
  const conflictAnalysis = {
    total_conflicts: conflicts.length,
    by_severity: {
      low: conflicts.filter(c => c.severity === 'low').length,
      medium: conflicts.filter(c => c.severity === 'medium').length,
      high: conflicts.filter(c => c.severity === 'high').length,
      critical: conflicts.filter(c => c.severity === 'critical').length
    },
    by_type: conflicts.reduce((acc, conflict) => {
      if (!acc[conflict.conflict_type]) {
        acc[conflict.conflict_type] = 0;
      }
      acc[conflict.conflict_type]++;
      return acc;
    }, {} as Record<string, number>)
  };
  
  return {
    role_id: roleId,
    conflicts,
    analysis: conflictAnalysis,
    has_critical_conflicts: conflictAnalysis.by_severity.critical > 0,
    requires_immediate_attention: conflictAnalysis.by_severity.high > 0 || conflictAnalysis.by_severity.critical > 0
  };
});

// Get role permission validation summary
export const getRolePermissionValidationSummary = cache(async (roleId: string | number) => {
  const [validationResults] = await Promise.all([
    // This would call the validation repository
    Promise.resolve([] as IRolePermissionValidationResult[])
  ]);
  
  const summary = {
    total_validations: validationResults.length,
    valid_count: validationResults.filter(v => v.is_valid).length,
    invalid_count: validationResults.filter(v => !v.is_valid).length,
    error_count: validationResults.reduce((sum, v) => sum + v.errors.length, 0),
    warning_count: validationResults.reduce((sum, v) => sum + v.warnings.length, 0)
  };
  
  return {
    role_id: roleId,
    validation_results: validationResults,
    summary,
    is_healthy: summary.invalid_count === 0 && summary.error_count === 0
  };
});

// Get role permission matrix analysis
export const getRolePermissionMatrixAnalysis = cache(async () => {
  const [matrix] = await Promise.all([
    getRolePermissionMatrixAnalysis({ per_page: 1000 }) // Get comprehensive matrix
  ]);
  
  // Analyze matrix data
  const analysis = {
    total_roles: matrix.total_roles,
    total_permissions: matrix.total_permissions,
    total_assignments: matrix.total_assignments,
    active_assignments: matrix.active_assignments,
    average_permissions_per_role: matrix.total_assignments / matrix.total_roles,
    average_roles_per_permission: matrix.total_assignments / matrix.total_permissions,
    assignment_density: (matrix.total_assignments / (matrix.total_roles * matrix.total_permissions)) * 100
  };
  
  // Group by resource type
  const byResource = matrix.matrix.reduce((acc, item) => {
    const resource = item.permission_resource || 'unknown';
    if (!acc[resource]) {
      acc[resource] = { count: 0, active: 0 };
    }
    acc[resource].count++;
    if (item.isActive) acc[resource].active++;
    return acc;
  }, {} as Record<string, { count: number; active: number }>);
  
  // Group by action type
  const byAction = matrix.matrix.reduce((acc, item) => {
    const action = item.permission_action || 'unknown';
    if (!acc[action]) {
      acc[action] = { count: 0, active: 0 };
    }
    acc[action].count++;
    if (item.isActive) acc[action].active++;
    return acc;
  }, {} as Record<string, { count: number; active: number }>);
  
  return {
    matrix: matrix.matrix,
    analysis,
    by_resource: Object.entries(byResource).map(([resource, data]) => ({ resource, ...data })),
    by_action: Object.entries(byAction).map(([action, data]) => ({ action, ...data }))
  };
});
