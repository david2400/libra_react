import 'server-only';
import { cache } from 'react';

import { 
  menuPermissionsRepository, 
  menuPermissionStatsRepository,
  menuPermissionBulkRepository,
  menuPermissionValidationRepository,
  menuPermissionActivityRepository,
  menuPermissionInheritanceRepository,
  menuPermissionConflictRepository,
  menuPermissionExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IMenuPermission, 
  IMenuPermissionStats,
  IMenuPermissionOverview,
  IBulkMenuPermissionPayload,
  IBulkMenuPermissionResponse,
  IMenuPermissionValidationResult,
  IMenuPermissionValidationRequest,
  IMenuPermissionActivity,
  IMenuPermissionActivityFilter,
  IMenuPermissionExportRequest,
  IMenuPermissionExportResponse,
  IMenuPermissionInheritanceTree,
  IMenuPermissionConflict,
  IMenuPermissionConflictResolution
} from './types';

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

export const getActivePermissionsForMenu = cache((menuId: string | number) => 
  menuPermissionsRepository.getActivePermissions(menuId)
);

// --- IMenu-IPermission Statistics Queries ---------------------------------

export const getMenuPermissionStats = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionStatsRepository.getStats(menuId, permissionId)
);

export const getAllMenuPermissionStats = cache(() => 
  menuPermissionStatsRepository.getAllStats()
);

export const getMenuPermissionOverview = cache((menuId: string | number, permissionId: string | number) => 
  menuPermissionStatsRepository.getOverview(menuId, permissionId)
);

// --- IMenu-IPermission Inheritance Queries ---------------------------------

export const getInheritedPermissionsForMenu = cache((menuId: string | number) => 
  menuPermissionInheritanceRepository.getInheritedPermissions(menuId)
);

export const getMenuPermissionInheritanceTree = cache((menuId: string | number) => 
  menuPermissionInheritanceRepository.getInheritanceTree(menuId)
);

// --- IMenu-IPermission Activity Queries ---------------------------------

export const getMenuPermissionActivities = cache((params?: ListParams) => 
  menuPermissionActivityRepository.list(params)
);

export const getActivitiesByMenu = cache((menuId: string | number, params?: ListParams) => 
  menuPermissionActivityRepository.getByMenu(menuId, params)
);

export const getActivitiesByPermission = cache((permissionId: string | number, params?: ListParams) => 
  menuPermissionActivityRepository.getByPermission(permissionId, params)
);

export const getRecentMenuPermissionActivities = cache((menuId: string | number, limit?: number) => 
  menuPermissionActivityRepository.getRecent(menuId, limit)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get menu with all permission relationships
export const getMenuWithPermissions = cache(async (menuId: string | number) => {
  const [permissions, activePermissions, inheritedPermissions, recentActivities] = await Promise.all([
    getPermissionsByMenu(menuId),
    getActivePermissionsForMenu(menuId),
    getInheritedPermissionsForMenu(menuId),
    getRecentMenuPermissionActivities(menuId, 10)
  ]);
  
  return {
    menu_id: menuId,
    permissions,
    active_permissions: activePermissions,
    inherited_permissions: inheritedPermissions,
    recent_activities: recentActivities,
    total_permissions: permissions.length,
    active_count: activePermissions.length,
    inherited_count: inheritedPermissions.length
  };
});

// Get permission with all menu relationships
export const getPermissionWithMenus = cache(async (permissionId: string | number) => {
  const [menus, recentActivities] = await Promise.all([
    getMenusByPermission(permissionId),
    getActivitiesByPermission(permissionId, { per_page: 10 })
  ]);
  
  return {
    permission_id: permissionId,
    menus,
    recent_activities: recentActivities.data,
    total_menus: menus.length
  };
});

// Get menu permission dashboard data
export const getMenuPermissionDashboard = cache(async () => {
  const [menuPermissions, allStats] = await Promise.all([
    getMenuPermissions({ per_page: 100 }),
    getAllMenuPermissionStats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = menuPermissions.data.map(menuPermission => {
    const stats = allStats.find(s => s.menu_id === menuPermission.menu_id && s.permission_id === menuPermission.permission_id);
    
    return {
      ...menuPermission,
      stats: stats || {
        menu_id: menuPermission.menu_id,
        permission_id: menuPermission.permission_id,
        usage_count: 0,
        created_at: menuPermission.created_at || ''
      }
    };
  });
  
  return {
    menu_permissions: dashboardData,
    summary: {
      total_relationships: menuPermissions.meta.total,
      total_usage: allStats.reduce((sum, s) => sum + s.usage_count, 0),
      active_relationships: dashboardData.filter(mp => mp.is_active).length
    }
  };
});

// Get menu permission usage patterns
export const getMenuPermissionUsagePatterns = cache(async (menuId: string | number, days: number = 30) => {
  const [permissions, activities, stats] = await Promise.all([
    getPermissionsByMenu(menuId),
    getActivitiesByMenu(menuId, { per_page: days * 24 }), // Assuming hourly checks
    getAllMenuPermissionStats().then(allStats => 
      allStats.filter(s => s.menu_id === menuId)
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
    menuId: menuId,
    patterns: permissionUsagePatterns.sort((a, b) => b.usage_count - a.usage_count),
    summary: {
      total_uses: usagePatterns.length,
      unique_permissions_used: permissionUsagePatterns.filter(p => p.usage_count > 0).length,
      most_used_permission: permissionUsagePatterns[0]?.permission || null
    }
  };
});

// Get menu permission inheritance analysis
export const getMenuPermissionInheritanceAnalysis = cache(async (menuId: string | number) => {
  const [inheritanceTree, directPermissions] = await Promise.all([
    getMenuPermissionInheritanceTree(menuId),
    getPermissionsByMenu(menuId)
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
    menuId: menuId,
    inheritance_tree: inheritanceTree,
    analysis,
    inheritance_sources: Object.entries(analysis.inheritance_sources).map(([sourceId, count]) => ({
      menu_id: sourceId,
      inherited_count: count
    }))
  };
});

// Get menu permission conflict analysis
export const getMenuPermissionConflictAnalysis = cache(async (menuId: string | number) => {
  const [conflicts] = await Promise.all([
    menuPermissionConflictRepository.detectConflicts(menuId)
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
    menu_id: menuId,
    conflicts,
    analysis: conflictAnalysis,
    has_critical_conflicts: conflictAnalysis.by_severity.critical > 0,
    requires_attention: conflictAnalysis.by_severity.high + conflictAnalysis.by_severity.critical > 0
  };
});

// Get menu permission validation summary
export const getMenuPermissionValidationSummary = cache(async (menuId: string | number) => {
  const [validationResults] = await Promise.all([
    // This would call the validation repository
    Promise.resolve([] as IMenuPermissionValidationResult[])
  ]);
  
  const summary = {
    total_validations: validationResults.length,
    valid_count: validationResults.filter(v => v.is_valid).length,
    invalid_count: validationResults.filter(v => !v.is_valid).length,
    error_count: validationResults.reduce((sum, v) => sum + v.errors.length, 0),
    warning_count: validationResults.reduce((sum, v) => sum + v.warnings.length, 0)
  };
  
  return {
    menuId: menuId,
    validation_results: validationResults,
    summary,
    is_healthy: summary.invalid_count === 0 && summary.error_count === 0
  };
});
