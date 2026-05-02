import 'server-only';
import { cache } from 'react';

import { 
  applicationsRepository, 
  application_modules_repository,
  application_health_repository,
  application_config_repository,
  application_stats_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IApplication, 
  IModule,
  IApplicationModule,
  IApplicationHealth,
  IHealthCheckResponse,
  IBulkHealthCheckResponse,
  IApplicationConfig,
  IApplicationStats,
  ApplicationOverview
} from './types';

// --- Applications Queries -----------------------------------------------------

export const get_applications = cache((params?: ListParams) => 
  applicationsRepository.list(params)
);

export const get_application_by_id = cache((id: string | number) => 
  applicationsRepository.getById(id)
);

export const get_active_applications = cache(() => 
  applicationsRepository.getActive()
);

// --- IApplication-IModule Relationships Queries ---------------------------------

export const get_application_modules = cache((params?: ListParams) => 
  application_modules_repository.list(params)
);

export const get_application_module_by_id = cache((applicationId: string | number, moduleId: string | number) => 
  application_modules_repository.getById(applicationId, moduleId)
);

export const get_modules_by_application = cache((applicationId: string | number) => 
  application_modules_repository.get_modules_by_application(applicationId)
);

export const get_applications_by_module = cache((moduleId: string | number) => 
  application_modules_repository.get_applications_by_module(moduleId)
);

// --- IApplication Health Queries ---------------------------------------------

export const check_application_health = cache((applicationId: string | number) => 
  application_health_repository.check_health(applicationId)
);

export const check_all_applications_health = cache(() => 
  application_health_repository.check_all_health()
);

export const get_health_history = cache((applicationId: string | number, params?: ListParams) => 
  application_health_repository.get_health_history(applicationId, params)
);

// --- IApplication Configuration Queries -------------------------------------

export const get_application_configs = cache((applicationId: string | number, params?: ListParams) => 
  application_config_repository.list(applicationId, params)
);

export const get_application_config_by_key = cache((applicationId: string | number, key: string) => 
  application_config_repository.get_by_key(applicationId, key)
);

// --- IApplication Statistics Queries -----------------------------------------

export const get_application_stats = cache((applicationId: string | number) => 
  application_stats_repository.getStats(applicationId)
);

export const get_all_applications_stats = cache(() => 
  application_stats_repository.get_all_stats()
);

export const get_application_overview = cache((applicationId: string | number) => 
  application_stats_repository.getOverview(applicationId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get application with all relationships
export const get_application_profile = cache(async (applicationId: string | number) => {
  const [application, modules, health, stats, configs] = await Promise.all([
    get_application_by_id(applicationId),
    get_modules_by_application(applicationId),
    check_application_health(applicationId),
    get_application_stats(applicationId),
    get_application_configs(applicationId)
  ]);
  
  return {
    application,
    modules,
    health,
    stats,
    configs: configs.data,
    config_count: configs.meta.total
  };
});

// Get applications dashboard data
export const get_applications_dashboard = cache(async () => {
  const [applications, allHealth, allStats] = await Promise.all([
    get_applications({ per_page: 100 }),
    check_all_applications_health(),
    get_all_applications_stats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = applications.data.map(app => {
    const health = allHealth.results.find(h => h.application.id === app.id);
    const stats = allStats.find(s => s.applicationId === app.id);
    
    return {
      ...app,
      health: health?.health,
      stats: stats || {
        applicationId: app.id,
        totalUsers: 0,
        activeSessions: 0,
        last_updated: new Date().toISOString()
      }
    };
  });
  
  return {
    applications: dashboardData,
    summary: allHealth.summary,
    total_applications: applications.meta.total
  };
});

// Get application health trends
export const get_application_health_trends = cache(async (applicationId: string | number, days: number = 7) => {
  const [healthHistory] = await Promise.all([
    get_health_history(applicationId, { per_page: days * 24 }) // Assuming hourly checks
  ]);
  
  // Process health data for trends
  const trends = healthHistory.data.map(health => ({
    timestamp: health.last_checked,
    status: health.status,
    response_time: health.response_time
  }));
  
  return {
    applicationId: applicationId,
    trends,
    summary: {
      total_checks: trends.length,
      healthy_count: trends.filter(t => t.status === 'healthy').length,
      unhealthy_count: trends.filter(t => t.status === 'unhealthy').length,
      degraded_count: trends.filter(t => t.status === 'degraded').length,
      average_response_time: trends.reduce((sum, t) => sum + (t.response_time || 0), 0) / trends.length
    }
  };
});

// Get applications by status
export const get_applications_by_status = cache(async (status: 'active' | 'inactive' | 'maintenance') => {
  const applications = await get_applications({ per_page: 100 });
  
  const filteredApps = applications.data.filter(app => app.status === status);
  
  return {
    applications: filteredApps,
    status,
    count: filteredApps.length
  };
});
