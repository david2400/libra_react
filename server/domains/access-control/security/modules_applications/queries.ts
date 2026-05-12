import 'server-only';
import { cache } from 'react';

import { 
  modulesRepository, 
  moduleApplicationsRepository,
  moduleStatsRepository,
  moduleConfigRepository,
  moduleActivityRepository,
  moduleHealthRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IModule, 
  IApplication,
  IModuleApplication,
  IModuleStats,
  IModuleOverview,
  IModuleConfig,
  // IModuleActivity,
  // IModuleActivityFilter,
  // IModuleHealth,
  // IModuleHealthResponse,
  // IBulkModuleHealthResponse
} from './types';

// --- Modules Queries ---------------------------------------------------------

export const getModules = cache((params?: ListParams) => 
  modulesRepository.list(params)
);

export const getModuleById = cache((id: string | number) => 
  modulesRepository.getById(id)
);

export const getActiveModules = cache(() => 
  modulesRepository.getActive()
);

// --- IModule-IApplication Relationships Queries ---------------------------------

export const getModuleApplications = cache((params?: ListParams) => 
  moduleApplicationsRepository.list(params)
);

export const getModuleApplicationById = cache((moduleId: string | number, applicationId: string | number) => 
  moduleApplicationsRepository.getById(moduleId, applicationId)
);

export const getApplicationsByModule = cache((moduleId: string | number) => 
  moduleApplicationsRepository.getApplicationsByModule(moduleId)
);

export const getModulesByApplication = cache((applicationId: string | number) => 
  moduleApplicationsRepository.getModulesByApplication(applicationId)
);

export const getActiveApplicationsForModule = cache((moduleId: string | number) => 
  moduleApplicationsRepository.getActiveApplications(moduleId)
);

// --- IModule Statistics Queries ---------------------------------------------

export const getModuleStats = cache((moduleId: string | number) => 
  moduleStatsRepository.getStats(moduleId)
);

export const getAllModulesStats = cache(() => 
  moduleStatsRepository.getAllStats()
);

export const getModuleOverview = cache((moduleId: string | number) => 
  moduleStatsRepository.getOverview(moduleId)
);

// --- IModule Configuration Queries -----------------------------------------

export const getModuleConfigs = cache((moduleId: string | number, applicationId?: string | number, params?: ListParams) => 
  moduleConfigRepository.list(moduleId, applicationId, params)
);

export const getModuleConfigByKey = cache((moduleId: string | number, applicationId: string | number, key: string) => 
  moduleConfigRepository.getByKey(moduleId, applicationId, key)
);

// --- IModule Activity Queries ---------------------------------------------

export const getModuleActivities = cache((params?: ListParams) => 
  moduleActivityRepository.list(params)
);

export const getActivitiesByModule = cache((moduleId: string | number, params?: ListParams) => 
  moduleActivityRepository.getByModule(moduleId, params)
);

export const getRecentModuleActivities = cache((moduleId: string | number, limit?: number) => 
  moduleActivityRepository.getRecent(moduleId, limit)
);

// --- IModule Health Queries ---------------------------------------------

export const checkModuleHealth = cache((moduleId: string | number) => 
  moduleHealthRepository.checkHealth(moduleId)
);

export const checkAllModulesHealth = cache(() => 
  moduleHealthRepository.checkAllHealth()
);

export const getModuleHealthHistory = cache((moduleId: string | number, params?: ListParams) => 
  moduleHealthRepository.getHealthHistory(moduleId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get module with all relationships
export const getModuleProfile = cache(async (moduleId: string | number) => {
  const [module, applications, stats, activeApplications, recentActivities, configs] = await Promise.all([
    getModuleById(moduleId),
    getApplicationsByModule(moduleId),
    getModuleStats(moduleId),
    getActiveApplicationsForModule(moduleId),
    getRecentModuleActivities(moduleId, 5),
    getModuleConfigs(moduleId)
  ]);
  
  return {
    module,
    applications,
    stats,
    active_applications: activeApplications,
    recent_activities: recentActivities,
    configs: configs.data,
    config_count: configs.meta.total
  };
});

// Get modules dashboard data
export const getModulesDashboard = cache(async () => {
  const [modules, allStats, allHealth] = await Promise.all([
    getModules({ per_page: 100 }),
    getAllModulesStats(),
    checkAllModulesHealth()
  ]);
  
  // Combine data for dashboard
  const dashboardData = modules.data.map(module => {
    const stats = allStats.find(s => s.module_id === module.id);
    const health = allHealth.results.find(h => h.module.id === module.id);
    
    return {
      ...module,
      stats: stats || {
        module_id: module.id,
        total_applications: 0,
        active_applications: 0,
        usage_count: 0,
        last_activity: module.created_at || ''
      },
      health: health?.health
    };
  });
  
  return {
    modules: dashboardData,
    summary: {
      total_modules: modules.meta.total,
      total_applications: allStats.reduce((sum, s) => sum + s.total_applications, 0),
      total_usage: allStats.reduce((sum, s) => sum + s.usage_count, 0),
      healthy_modules: allHealth.results.filter(h => h.health.status === 'healthy').length,
      warning_modules: allHealth.results.filter(h => h.health.status === 'warning').length,
      critical_modules: allHealth.results.filter(h => h.health.status === 'critical').length,
      inactive_modules: allHealth.results.filter(h => h.health.status === 'inactive').length
    }
  };
});

// Get module activity trends
export const getModuleActivityTrends = cache(async (moduleId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    getActivitiesByModule(moduleId, { per_page: days * 24 }) // Assuming hourly checks
  ]);
  
  // Process activity data for trends
  const trends = activities.data.map(activity => ({
    timestamp: activity.created_at,
    activity_type: activity.activity_type,
    description: activity.description,
    metadata: activity.metadata
  }));
  
  // Group by activity type
  const groupedTrends = trends.reduce((acc, trend) => {
    if (!acc[trend.activity_type]) {
      acc[trend.activity_type] = [];
    }
    acc[trend.activity_type].push(trend);
    return acc;
  }, {} as Record<string, typeof trends>);
  
  return {
    module_id: moduleId,
    trends: groupedTrends,
    summary: {
      total_activities: trends.length,
      activity_types: Object.keys(groupedTrends),
      most_common_activity: Object.entries(groupedTrends)
        .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || 'none'
    }
  };
});

// Get modules by category
export const getModulesByCategory = cache(async (category: string) => {
  const modules = await getModules({ per_page: 100 });
  
  const filteredModules = modules.data.filter(module => module.category === category);
  
  return {
    category,
    modules: filteredModules,
    count: filteredModules.length
  };
});

// Get applications by module with details
export const getApplicationsByModuleWithDetails = cache(async (moduleId: string | number) => {
  const [applications, moduleApplications] = await Promise.all([
    getApplicationsByModule(moduleId),
    getModuleApplications({ params: { module_id: moduleId } })
  ]);
  
  // Combine application data with relationship info
  const applicationsWithDetails = applications.map(application => {
    const relationship = moduleApplications.data.find(ma => ma.application_id === application.id);
    
    return {
      ...application,
      relationship: {
        is_active: relationship?.is_active,
        configuration: relationship?.configuration
      }
    };
  });
  
  return {
    module_id: moduleId,
    applications: applicationsWithDetails,
    total_applications: applicationsWithDetails.length,
    active_applications: applicationsWithDetails.filter(a => a.relationship.is_active).length
  };
});

// Get module performance metrics
export const getModulePerformanceMetrics = cache(async (moduleId: string | number) => {
  const [module, stats, health, activities] = await Promise.all([
    getModuleById(moduleId),
    getModuleStats(moduleId),
    checkModuleHealth(moduleId),
    getActivitiesByModule(moduleId, { per_page: 100 })
  ]);
  
  // Calculate performance metrics
  const applicationUsageRate = stats.total_applications > 0 ? (stats.active_applications / stats.total_applications) * 100 : 0;
  const recentActivities = activities.data.filter(a => {
    const activityDate = new Date(a.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return activityDate >= thirtyDaysAgo;
  });
  
  return {
    module_id: moduleId,
    module_name: module.name,
    metrics: {
      application_usage_rate,
      health_score: health.health.metrics,
      recent_activity_count: recentActivities.length,
      usage_frequency: stats.usage_count,
      overall_score: (applicationUsageRate + health.health.metrics.performance_score + (recentActivities.length > 0 ? 50 : 0)) / 3
    },
    health_status: health.health.status,
    last_updated: new Date().toISOString()
  };
});

// Get modules with health issues
export const getModulesWithHealthIssues = cache(async () => {
  const [modules, allStats, allHealth] = await Promise.all([
    getModules({ per_page: 100 }),
    getAllModulesStats(),
    checkAllModulesHealth()
  ]);
  
  const modulesWithHealth = modules.data.map(module => {
    const stats = allStats.find(s => s.module_id === module.id);
    const health = allHealth.results.find(h => h.module.id === module.id);
    
    return {
      ...module,
      stats: stats || {
        module_id: module.id,
        total_applications: 0,
        active_applications: 0,
        usage_count: 0
      },
      health: health?.health || {
        module_id: module.id,
        status: 'inactive' as const,
        metrics: {
          application_usage_rate: 0,
          error_rate: 0,
          performance_score: 0
        },
        last_checked: new Date().toISOString()
      }
    };
  });
  
  const withIssues = modulesWithHealth.filter(m => 
    m.health.status === 'warning' || m.health.status === 'critical' || m.health.status === 'inactive'
  );
  
  return {
    modules: withIssues,
    total_with_issues: withIssues.length,
    total_modules: modules.data.length,
    percentage_with_issues: (withIssues.length / modules.data.length) * 100,
    breakdown: {
      warning: withIssues.filter(m => m.health.status === 'warning').length,
      critical: withIssues.filter(m => m.health.status === 'critical').length,
      inactive: withIssues.filter(m => m.health.status === 'inactive').length
    }
  };
});
