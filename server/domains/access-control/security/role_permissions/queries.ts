import 'server-only';
import { cache } from 'react';

import { 
  rolePermissionsRepository, 
  role_permission_stats_repository,
  role_permission_bulk_repository,
  role_permission_validation_repository,
  role_permission_activity_repository,
  role_permission_inheritance_repository,
  role_permission_conflict_repository,
  role_permission_export_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IRolePermission, 
  IRole,
  IPermission,
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

export const get_active_permissions_for_role = cache((roleId: string | number) => 
  rolePermissionsRepository.get_active_permissions(roleId)
);

// --- IRole-IPermission Statistics Queries ---------------------------------

export const get_role_permission_stats = cache((roleId: string | number, permissionId: string | number) => 
  role_permission_stats_repository.getStats(roleId, permissionId)
);

export const get_all_role_permission_stats = cache(() => 
  role_permission_stats_repository.get_all_stats()
);

export const get_role_permission_overview = cache((roleId: string | number, permissionId: string | number) => 
  role_permission_stats_repository.getOverview(roleId, permissionId)
);

// --- IRole-IPermission Inheritance Queries ---------------------------------

export const get_inherited_permissions_for_role = cache((roleId: string | number) => 
  role_permission_inheritance_repository.get_inherited_permissions(roleId)
);

export const get_role_permission_inheritance_tree = cache((roleId: string | number) => 
  role_permission_inheritance_repository.get_inheritance_tree(roleId)
);

// --- IRole-IPermission Activity Queries ---------------------------------

export const get_role_permission_activities = cache((params?: ListParams) => 
  role_permission_activity_repository.list(params)
);

export const get_activities_by_role = cache((roleId: string | number, params?: ListParams) => 
  role_permission_activity_repository.get_by_role(roleId, params)
);

export const get_activities_by_permission = cache((permissionId: string | number, params?: ListParams) => 
  role_permission_activity_repository.get_by_permission(permissionId, params)
);

export const get_recent_role_permission_activities = cache((roleId: string | number, limit?: number) => 
  role_permission_activity_repository.getRecent(roleId, limit)
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
export const get_role_with_permissions = cache(async (roleId: string | number) => {
  const [permissions, activePermissions, inheritedPermissions, recentActivities] = await Promise.all([
    get_permissions_by_role(roleId),
    get_active_permissions_for_role(roleId),
    get_inherited_permissions_for_role(roleId),
    get_recent_role_permission_activities(roleId, 10)
  ]);
  
  return {
    roleId: roleId,
    permissions,
    active_permissions: activePermissions,
    inherited_permissions,
    recent_activities: recentActivities,
    total_permissions: permissions.length,
    active_count: activePermissions.length,
    inherited_count: inheritedPermissions.length
  };
});

// Get permission with all role relationships
export const get_permission_with_roles = cache(async (permissionId: string | number) => {
  const [roles, recentActivities] = await Promise.all([
    get_roles_by_permission(permissionId),
    get_activities_by_permission(permissionId, { per_page: 10 })
  ]);
  
  return {
    permissionId: permissionId,
    roles,
    recent_activities: recentActivities.data,
    total_roles: roles.length
  };
});

// Get role permission dashboard data
export const get_role_permission_dashboard = cache(async () => {
  const [rolePermissions, allStats] = await Promise.all([
    get_role_permissions({ per_page: 100 }),
    get_all_role_permission_stats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = rolePermissions.data.map(rolePermission => {
    const stats = allStats.find(s => s.roleId === rolePermission.roleId && s.permissionId === rolePermission.permissionId);
    
    return {
      ...rolePermission,
      stats: stats || {
        roleId: rolePermission.roleId,
        permissionId: rolePermission.permissionId,
        usage_count: 0,
        createdAt: rolePermission.createdAt || ''
      }
    };
  });
  
  return {
    role_permissions: dashboardData,
    summary: {
      total_relationships: rolePermissions.meta.total,
      total_usage: allStats.reduce((sum, s) => sum + s.usage_count, 0),
      active_relationships: dashboardData.filter(rp => rp.isActive).length
    }
  };
});

// Get role permission usage patterns
export const get_role_permission_usage_patterns = cache(async (roleId: string | number, days: number = 30) => {
  const [permissions, activities, stats] = await Promise.all([
    get_permissions_by_role(roleId),
    get_activities_by_role(roleId, { per_page: days * 24 }), // Assuming hourly checks
    get_all_role_permission_stats().then(allStats => 
      allStats.filter(s => s.roleId === roleId)
    )
  ]);
  
  // Process usage data
  const usagePatterns = activities.data
    .filter(activity => activity.activityType === 'permission_used')
    .map(activity => ({
      timestamp: activity.createdAt,
      permissionId: activity.permissionId,
      description: activity.description,
      metadata: activity.metadata
    }));
  
  // Group by permission
  const permissionUsagePatterns = permissions.map(permission => {
    const permissionActivities = usagePatterns.filter(up => up.permissionId === permission.id);
    const permissionStats = stats.find(s => s.permissionId === permission.id);
    
    return {
      permission,
      usage_count: permissionActivities.length,
      last_used: permissionActivities.length > 0 ? permissionActivities[0].timestamp : permissionStats?.last_used,
      usage_frequency: permissionActivities.length / days // uses per day
    };
  });
  
  return {
    roleId: roleId,
    patterns: permissionUsagePatterns.sort((a, b) => b.usage_count - a.usage_count),
    summary: {
      total_uses: usagePatterns.length,
      unique_permissions_used: permissionUsagePatterns.filter(p => p.usage_count > 0).length,
      most_used_permission: permissionUsagePatterns[0]?.permission || null
    }
  };
});

// Get role permission inheritance analysis
export const get_role_permission_inheritance_analysis = cache(async (roleId: string | number) => {
  const [inheritanceTree, directPermissions] = await Promise.all([
    get_role_permission_inheritance_tree(roleId),
    get_permissions_by_role(roleId)
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
    roleId: roleId,
    inheritance_tree: inheritanceTree,
    analysis,
    inheritance_sources: Object.entries(analysis.inheritance_sources).map(([sourceId, count]) => ({
      roleId: sourceId,
      inherited_count: count
    }))
  };
});

// Get role permission conflict analysis
export const get_role_permission_conflict_analysis = cache(async (roleId: string | number) => {
  const [conflicts] = await Promise.all([
    role_permission_conflict_repository.detect_conflicts(roleId)
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
    roleId: roleId,
    conflicts,
    analysis: conflictAnalysis,
    has_critical_conflicts: conflictAnalysis.critical > 0,
    requires_attention: conflictAnalysis.high + conflictAnalysis.critical > 0
  };
});

// Get role permission validation summary
export const get_role_permission_validation_summary = cache(async (roleId: string | number) => {
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
    roleId: roleId,
    validation_results: validationResults,
    summary,
    is_healthy: summary.invalid_count === 0 && summary.error_count === 0
  };
});

// Get role permission matrix analysis
export const get_role_permission_matrix_analysis = cache(async () => {
  const [matrix] = await Promise.all([
    get_role_permission_matrix({ per_page: 1000 }) // Get comprehensive matrix
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
