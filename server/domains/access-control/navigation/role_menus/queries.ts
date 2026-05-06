import 'server-only';
import { cache } from 'react';

import { 
  roleMenusRepository, 
  roleMenuStatsRepository,
  roleMenuBulkRepository,
  roleMenuTreeRepository,
  roleMenuActivityRepository,
  roleMenuValidationRepository,
  roleMenuExportRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IRoleMenu, 
  IRole,
  IMenu,
  IRoleMenuStats,
  IRoleMenuOverview,
  IBulkRoleMenuPayload,
  IBulkRoleMenuResponse,
  IRoleMenuTreeResponse,
  IRoleMenuActivity,
  IRoleMenuActivityFilter,
  IRoleMenuValidationResult,
  IRoleMenuValidationRequest,
  IRoleMenuExportRequest,
  IRoleMenuExportResponse
} from './types';

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

export const getRolesByMenu = cache((menuId: string | number) => 
  roleMenusRepository.getRolesByMenu(menuId)
);

export const getActiveMenusForRole = cache((roleId: string | number) => 
  roleMenusRepository.getActiveMenus(roleId)
);

// --- IRole-IMenu Statistics Queries -----------------------------------------

export const getRoleMenuStats = cache((roleId: string | number, menuId: string | number) => 
  roleMenuStatsRepository.getStats(roleId, menuId)
);

export const getAllRoleMenuStats = cache(() => 
  roleMenuStatsRepository.getAllStats()
);

export const getRoleMenuOverview = cache((roleId: string | number, menuId: string | number) => 
  roleMenuStatsRepository.getOverview(roleId, menuId)
);

// --- IRole-IMenu Tree Queries ---------------------------------------------

export const getRoleMenuTree = cache((roleId: string | number) => 
  roleMenuTreeRepository.getTree(roleId)
);

export const getFlatRoleMenuStructure = cache((roleId: string | number) => 
  roleMenuTreeRepository.getFlat(roleId)
);

// --- IRole-IMenu Activity Queries -----------------------------------------

export const getRoleMenuActivities = cache((params?: ListParams) => 
  roleMenuActivityRepository.list(params)
);

export const getActivitiesByRole = cache((roleId: string | number, params?: ListParams) => 
  roleMenuActivityRepository.getByRole(roleId, params)
);

export const getActivitiesByMenu = cache((menuId: string | number, params?: ListParams) => 
  roleMenuActivityRepository.getByMenu(menuId, params)
);

export const getRecentRoleMenuActivities = cache((roleId: string | number, limit?: number) => 
  roleMenuActivityRepository.getRecent(roleId, limit)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get role with all menu relationships
export const getRoleWithMenus = cache(async (roleId: string | number) => {
  const [role, menus, activeMenus, recentActivities] = await Promise.all([
    // We would need to import role repository here, for now using roleId
    getMenusByRole(roleId),
    getActiveMenusForRole(roleId),
    getRecentRoleMenuActivities(roleId, 10)
  ]);
  
  return {
    roleId: roleId,
    menus,
    active_menus: activeMenus,
    recent_activities: recentActivities,
    total_menus: menus.length,
    active_count: activeMenus.length
  };
});

// Get menu with all role relationships
export const getMenuWithRoles = cache(async (menuId: string | number) => {
  const [menu, roles, recentActivities] = await Promise.all([
    // We would need to import menu repository here, for now using menuId
    getRolesByMenu(menuId),
    getActivitiesByMenu(menuId, { per_page: 10 })
  ]);
  
  return {
    menuId: menuId,
    roles,
    recent_activities: recentActivities,
    total_roles: roles.length
  };
});

// Get role menu dashboard data
export const getRoleMenuDashboard = cache(async () => {
  const [roleMenus, allStats] = await Promise.all([
    getRoleMenus({ per_page: 100 }),
    getAllRoleMenuStats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = roleMenus.data.map(roleMenu => {
    const stats = allStats.find(s => s.roleId === roleMenu.roleId && s.menuId === roleMenu.menuId);
    
    return {
      ...roleMenu,
      stats: stats || {
        roleId: roleMenu.roleId,
        menuId: roleMenu.menuId,
        access_count: 0,
        createdAt: roleMenu.createdAt || ''
      }
    };
  });
  
  return {
    role_menus: dashboardData,
    summary: {
      total_relationships: roleMenus.meta.total,
      total_access_count: allStats.reduce((sum, s) => sum + s.access_count, 0),
      active_relationships: dashboardData.filter(rm => rm.isActive).length
    }
  };
});

// Get role menu access patterns
export const getRoleMenuAccessPatterns = cache(async (roleId: string | number, days: number = 30) => {
  const [menus, activities] = await Promise.all([
    getMenusByRole(roleId),
    getActivitiesByRole(roleId, { per_page: days * 24 }) // Assuming hourly checks
  ]);
  
  // Process access data
  const accessPatterns = activities.data
    .filter(activity => activity.activityType === 'menu_accessed')
    .map(activity => ({
      timestamp: activity.createdAt,
      menuId: activity.menuId,
      description: activity.description,
      metadata: activity.metadata
    }));
  
  // Group by menu
  const menuAccessPatterns = menus.map(menu => {
    const menuActivities = accessPatterns.filter(ap => ap.menuId === menu.id);
    
    return {
      menu,
      access_count: menuActivities.length,
      last_accessed: menuActivities.length > 0 ? menuActivities[0].timestamp : undefined,
      access_frequency: menuActivities.length / days // accesses per day
    };
  });
  
  return {
    roleId: roleId,
    patterns: menuAccessPatterns.sort((a, b) => b.access_count - a.access_count),
    summary: {
      total_accesses: accessPatterns.length,
      unique_menus_accessed: menuAccessPatterns.filter(m => m.access_count > 0).length,
      most_accessed_menu: menuAccessPatterns[0]?.menu || null
    }
  };
});

// Get role menu hierarchy analysis
export const getRoleMenuHierarchyAnalysis = cache(async (roleId: string | number) => {
  const [menuTree, flatStructure] = await Promise.all([
    getRoleMenuTree(roleId),
    getFlatRoleMenuStructure(roleId)
  ]);
  
  // Analyze hierarchy
  const depthAnalysis = flatStructure.reduce((acc, item) => {
    const depth = item.level;
    if (!acc[depth]) {
      acc[depth] = 0;
    }
    acc[depth]++;
    return acc;
  }, {} as Record<number, number>);
  
  const pathAnalysis = flatStructure.map(item => ({
    menuId: item.menu.id,
    path_length: item.path.length,
    path: item.path
  }));
  
  return {
    roleId: roleId,
    tree: menuTree,
    hierarchy_stats: {
      total_nodes: menuTree.total_nodes,
      max_depth: menuTree.max_depth,
      depth_distribution: depthAnalysis,
      average_path_length: pathAnalysis.reduce((sum, p) => sum + p.path_length, 0) / pathAnalysis.length
    },
    paths: pathAnalysis
  };
});

// Get role menu validation summary
export const getRoleMenuValidationSummary = cache(async (roleId: string | number) => {
  const [validationResults] = await Promise.all([
    // This would call the validation repository
    Promise.resolve([] as IRoleMenuValidationResult[])
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
    summary
  };
});

// Get role menu usage statistics
export const getRoleMenuUsageStats = cache(async (roleId: string | number) => {
  const [menus, stats] = await Promise.all([
    getMenusByRole(roleId),
    getAllRoleMenuStats().then(allStats => 
      allStats.filter(s => s.roleId === roleId)
    )
  ]);
  
  const menuStats = menus.map(menu => {
    const stat = stats.find(s => s.menuId === menu.id);
    
    return {
      menu,
      access_count: stat?.access_count || 0,
      last_accessed: stat?.last_accessed,
      isActive: stat !== undefined
    };
  });
  
  return {
    roleId: roleId,
    menu_stats: menuStats.sort((a, b) => b.access_count - a.access_count),
    summary: {
      total_menus: menus.length,
      accessed_menus: menuStats.filter(m => m.access_count > 0).length,
      total_accesses: menuStats.reduce((sum, m) => sum + m.access_count, 0),
      most_accessed_menu: menuStats[0]?.menu || null
    }
  };
});
