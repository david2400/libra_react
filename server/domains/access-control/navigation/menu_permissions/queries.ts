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
  IMenuPermissionValidationResult,

} from './types';

// --- MenuPermission Entity Queries (Based on Java MenuPermissionEntity) ---------

export const getMenuPermissions = cache((params?: ListParams) =>
  menuPermissionsRepository.list(params)
);

export const getMenuPermissionById = cache((idMenuPermission: number) =>
  menuPermissionsRepository.getById(idMenuPermission)
);

export const getMenuPermissionsByMenu = cache((menuId: number) =>
  menuPermissionsRepository.list({ menu_id: menuId })
);

export const getMenuPermissionsByRole = cache((roleId: number) =>
  menuPermissionsRepository.list({ role_id: roleId })
);

export const getMenuPermissionsByUser = cache((userId: number) =>
  menuPermissionsRepository.list({ user_id: userId })
);

export const getActiveMenuPermissions = cache((menuId: number) =>
  menuPermissionsRepository.getActivePermissions(menuId)
);

// --- MenuPermission Statistics Queries ---------------------------------------

export const getMenuPermissionStats = cache((idMenuPermission: number) =>
  menuPermissionStatsRepository.getStats(idMenuPermission, 0) // Temporal hasta que se actualice el repository
);

export const getAllMenuPermissionStats = cache(() =>
  menuPermissionStatsRepository.getAllStats()
);

export const getMenuPermissionOverview = cache((idMenuPermission: number) =>
  menuPermissionStatsRepository.getOverview(idMenuPermission, 0) // Temporal hasta que se actualice el repository
);

// --- IMenu-IPermission Inheritance Queries ---------------------------------

export const getInheritedPermissionsForMenu = cache((menuId: number) =>
  menuPermissionInheritanceRepository.getInheritedPermissions(menuId)
);

export const getMenuPermissionInheritanceTree = cache((menuId: number) =>
  menuPermissionInheritanceRepository.getInheritanceTree(menuId)
);

// --- IMenu-IPermission Activity Queries ---------------------------------

export const getMenuPermissionActivities = cache((params?: ListParams) =>
  menuPermissionActivityRepository.list(params)
);

export const getActivitiesByMenu = cache((menuId: number, params?: ListParams) =>
  menuPermissionActivityRepository.getByMenu(menuId, params)
);

export const getActivitiesByPermission = cache((permissionId: number, params?: ListParams) =>
  menuPermissionActivityRepository.getByPermission(permissionId, params)
);

export const getRecentMenuPermissionActivities = cache((menuId: number, limit?: number) =>
  menuPermissionActivityRepository.getRecent(menuId, limit)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get menu with all permission relationships
export const getMenuWithPermissions = cache(async (menuId: number) => {
  const [permissions, activePermissions, inheritedPermissions, recentActivities] = await Promise.all([
    getMenuPermissionsByMenu(menuId),
    getActiveMenuPermissions(menuId),
    getInheritedPermissionsForMenu(menuId),
    getRecentMenuPermissionActivities(menuId, 10)
  ]);

  return {
    menu_id: menuId,
    permissions,
    active_permissions: activePermissions,
    inherited_permissions: inheritedPermissions,
    recent_activities: recentActivities,
    total_permissions: permissions.content.length,
    active_count: activePermissions.length,
    inherited_count: inheritedPermissions.length
  };
});

// Get menu permission with all related data (updated for new entity)
export const getMenuPermissionWithDetails = cache(async (idMenuPermission: number) => {
  const [permission, recentActivities] = await Promise.all([
    getMenuPermissionById(idMenuPermission),
    getRecentMenuPermissionActivities(idMenuPermission, 10)
  ]);

  return {
    permission,
    recent_activities: recentActivities,
    details: {
      assignment_type: permission?.assignment_type,
      priority: permission?.priority,
      is_expired: permission?.is_expired
    }
  };
});

// Get menu permission dashboard data
export const getMenuPermissionDashboard = cache(async () => {
  const [menuPermissions, allStats] = await Promise.all([
    getMenuPermissions({ per_page: 100 }),
    getAllMenuPermissionStats()
  ]);

  // Combine data for dashboard
  const dashboardData = menuPermissions.content.map((menuPermission: IMenuPermission) => {
    const stats = allStats.find(s => s.menu_id === menuPermission.menu_id);

    return {
      ...menuPermission,
      stats: stats || {
        menu_id: menuPermission.menu_id,
        usage_count: 0,
        created_at: menuPermission.created_at || ''
      }
    };
  });

  return {
    menu_permissions: dashboardData,
    summary: {
      total_relationships: menuPermissions.total_elements,
      total_usage: allStats.reduce((sum, s) => sum + s.usage_count, 0),
      active_relationships: dashboardData.filter(mp => (mp as any).is_active).length
    }
  };
});

// Get menu permission usage patterns
export const getMenuPermissionUsagePatterns = cache(async (menuId: number, days: number = 30) => {
  const [permissions, activities, stats] = await Promise.all([
    getMenuPermissionsByMenu(menuId),
    getActivitiesByMenu(menuId, { per_page: days * 24 }), // Assuming hourly checks
    getAllMenuPermissionStats().then(allStats =>
      allStats.filter(s => s.menu_id === menuId)
    )
  ]);

  // Process usage data
  const usagePatterns = activities.content
    .filter((activity: any) => activity.activity_type === 'permission_used')
    .map((activity: any) => ({
      timestamp: activity.created_at,
      menu_permission_id: activity.menu_id, // Usar menu_id en lugar de permission_id
      description: activity.description,
      metadata: activity.metadata
    }));

  // Group by permission
  const permissionUsagePatterns = (permissions as any).content?.map((permission: any) => {
    const permissionActivities = usagePatterns.filter((up: any) => up.menu_permission_id === permission.id_menu_permission);
    const permissionStats = stats.find((s: any) => s.id_menu_permission === permission.id_menu_permission);

    return {
      permission,
      usage_count: permissionActivities.length,
      last_used: permissionActivities.length > 0 ? permissionActivities[0].timestamp : permissionStats?.last_used,
      usage_frequency: permissionActivities.length / days // uses per day
    };
  }) || [];

  return {
    menuId: menuId,
    patterns: permissionUsagePatterns.content.sort((a: any, b: any) => b.usage_count - a.usage_count),
    summary: {
      total_uses: usagePatterns.length,
      unique_permissions_used: permissionUsagePatterns.filter((p: any) => p.usage_count > 0).length,
      most_used_permission: permissionUsagePatterns[0]?.permission || null
    }
  };
});

// Get menu permission inheritance analysis
export const getMenuPermissionInheritanceAnalysis = cache(async (menuId: number) => {
  const [inheritanceTree, directPermissions] = await Promise.all([
    getMenuPermissionInheritanceTree(menuId),
    getMenuPermissionsByMenu(menuId)
  ]);

  // Analyze inheritance
  const inheritedPermissions = inheritanceTree.inherited_permissions;
  const directPermissionsList = (directPermissions as any).content || [];
  const directPermissionIds = directPermissionsList.map((p: any) => p.id_menu_permission);
  const inheritedPermissionIds = inheritedPermissions.map((ip: any) => ip.permission.id_menu_permission);

  const analysis = {
    direct_permissions: directPermissionsList.length,
    inherited_permissions: inheritedPermissions.length,
    total_permissions: directPermissionsList.length + inheritedPermissions.length,
    inheritance_depth: Math.max(0, ...inheritedPermissions.map((ip: any) => ip.inheritance_level)),
    inheritance_sources: inheritedPermissions.reduce((acc: any, ip: any) => {
      const sourceId = ip.inherited_from.id_menu;
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
export const getMenuPermissionConflictAnalysis = cache(async (menuId: number) => {
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
export const getMenuPermissionValidationSummary = cache(async (menuId: number) => {
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
