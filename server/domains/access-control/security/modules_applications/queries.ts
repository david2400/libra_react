import 'server-only';
import { cache } from 'react';

import { 
  modules_repository, 
  module_applications_repository,
  module_stats_repository,
  module_config_repository,
  module_activity_repository,
  module_health_repository
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
  IModuleActivity,
  IModuleActivityFilter,
  IModuleHealth,
  IModuleHealthResponse,
  IBulkModuleHealthResponse
} from './types';

// --- Modules Queries ---------------------------------------------------------

export const get_modules = cache((params?: ListParams) => 
  modules_repository.list(params)
);

export const get_module_by_id = cache((id: string | number) => 
  modules_repository.getById(id)
);

export const get_active_modules = cache(() => 
  modules_repository.getActive()
);

// --- IModule-IApplication Relationships Queries ---------------------------------

export const get_module_applications = cache((params?: ListParams) => 
  module_applications_repository.list(params)
);

export const get_module_application_by_id = cache((moduleId: string | number, applicationId: string | number) => 
  module_applications_repository.getById(moduleId, applicationId)
);

export const get_applications_by_module = cache((moduleId: string | number) => 
  module_applications_repository.get_applications_by_module(moduleId)
);

export const get_modules_by_application = cache((applicationId: string | number) => 
  module_applications_repository.get_modules_by_application(applicationId)
);

export const get_active_applications_for_module = cache((moduleId: string | number) => 
  module_applications_repository.get_active_applications(moduleId)
);

// --- IModule Statistics Queries ---------------------------------------------

export const get_module_stats = cache((moduleId: string | number) => 
  module_stats_repository.getStats(moduleId)
);

export const get_all_modules_stats = cache(() => 
  module_stats_repository.get_all_stats()
);

export const get_module_overview = cache((moduleId: string | number) => 
  module_stats_repository.getOverview(moduleId)
);

// --- IModule Configuration Queries -----------------------------------------

export const get_module_configs = cache((moduleId: string | number, applicationId?: string | number, params?: ListParams) => 
  module_config_repository.list(moduleId, applicationId, params)
);

export const get_module_config_by_key = cache((moduleId: string | number, applicationId: string | number, key: string) => 
  module_config_repository.get_by_key(moduleId, applicationId, key)
);

// --- IModule Activity Queries ---------------------------------------------

export const get_module_activities = cache((params?: ListParams) => 
  module_activity_repository.list(params)
);

export const get_activities_by_module = cache((moduleId: string | number, params?: ListParams) => 
  module_activity_repository.get_by_module(moduleId, params)
);

export const get_recent_module_activities = cache((moduleId: string | number, limit?: number) => 
  module_activity_repository.getRecent(moduleId, limit)
);

// --- IModule Health Queries ---------------------------------------------

export const check_module_health = cache((moduleId: string | number) => 
  module_health_repository.check_health(moduleId)
);

export const check_all_modules_health = cache(() => 
  module_health_repository.check_all_health()
);

export const get_module_health_history = cache((moduleId: string | number, params?: ListParams) => 
  module_health_repository.get_health_history(moduleId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get module with all relationships
export const get_module_profile = cache(async (moduleId: string | number) => {
  const [module, applications, stats, activeApplications, recentActivities, configs] = await Promise.all([
    get_module_by_id(moduleId),
    get_applications_by_module(moduleId),
    get_module_stats(moduleId),
    get_active_applications_for_module(moduleId),
    get_recent_module_activities(moduleId, 5),
    get_module_configs(moduleId)
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
export const get_modules_dashboard = cache(async () => {
  const [modules, allStats, allHealth] = await Promise.all([
    get_modules({ per_page: 100 }),
    get_all_modules_stats(),
    check_all_modules_health()
  ]);
  
  // Combine data for dashboard
  const dashboardData = modules.data.map(module => {
    const stats = allStats.find(s => s.moduleId === module.id);
    const health = allHealth.results.find(h => h.module.id === module.id);
    
    return {
      ...module,
      stats: stats || {
        moduleId: module.id,
        total_applications: 0,
        active_applications: 0,
        usage_count: 0,
        lastActivity: module.createdAt || ''
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
export const get_module_activity_trends = cache(async (moduleId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    get_activities_by_module(moduleId, { per_page: days * 24 }) // Assuming hourly checks
  ]);
  
  // Process activity data for trends
  const trends = activities.data.map(activity => ({
    timestamp: activity.createdAt,
    activityType: activity.activityType,
    description: activity.description,
    metadata: activity.metadata
  }));
  
  // Group by activity type
  const groupedTrends = trends.reduce((acc, trend) => {
    if (!acc[trend.activityType]) {
      acc[trend.activityType] = [];
    }
    acc[trend.activityType].push(trend);
    return acc;
  }, {} as Record<string, typeof trends>);
  
  return {
    moduleId: moduleId,
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
export const get_modules_by_category = cache(async (category: string) => {
  const modules = await get_modules({ per_page: 100 });
  
  const filteredModules = modules.data.filter(module => module.category === category);
  
  return {
    category,
    modules: filteredModules,
    count: filteredModules.length
  };
});

// Get applications by module with details
export const get_applications_by_module_with_details = cache(async (moduleId: string | number) => {
  const [applications, moduleApplications] = await Promise.all([
    get_applications_by_module(moduleId),
    get_module_applications({ params: { moduleId: moduleId } })
  ]);
  
  // Combine application data with relationship info
  const applicationsWithDetails = applications.map(application => {
    const relationship = moduleApplications.data.find(ma => ma.applicationId === application.id);
    
    return {
      ...application,
      relationship: {
        isActive: relationship?.isActive,
        configuration: relationship?.configuration
      }
    };
  });
  
  return {
    moduleId: moduleId,
    applications: applicationsWithDetails,
    total_applications: applicationsWithDetails.length,
    active_applications: applicationsWithDetails.filter(a => a.relationship.isActive).length
  };
});

// Get module performance metrics
export const get_module_performance_metrics = cache(async (moduleId: string | number) => {
  const [module, stats, health, activities] = await Promise.all([
    get_module_by_id(moduleId),
    get_module_stats(moduleId),
    check_module_health(moduleId),
    get_activities_by_module(moduleId, { per_page: 100 })
  ]);
  
  // Calculate performance metrics
  const applicationUsageRate = stats.total_applications > 0 ? (stats.active_applications / stats.total_applications) * 100 : 0;
  const recentActivities = activities.data.filter(a => {
    const activityDate = new Date(a.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return activityDate >= thirtyDaysAgo;
  });
  
  return {
    moduleId: moduleId,
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
export const get_modules_with_health_issues = cache(async () => {
  const [modules, allStats, allHealth] = await Promise.all([
    get_modules({ per_page: 100 }),
    get_all_modules_stats(),
    check_all_modules_health()
  ]);
  
  const modulesWithHealth = modules.data.map(module => {
    const stats = allStats.find(s => s.moduleId === module.id);
    const health = allHealth.results.find(h => h.module.id === module.id);
    
    return {
      ...module,
      stats: stats || {
        moduleId: module.id,
        total_applications: 0,
        active_applications: 0,
        usage_count: 0
      },
      health: health?.health || {
        moduleId: module.id,
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
