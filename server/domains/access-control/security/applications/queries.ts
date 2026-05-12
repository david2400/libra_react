import 'server-only';
import { cache } from 'react';

import { 
  applicationsRepository, 
  applicationModulesRepository,
  applicationHealthRepository,
  applicationConfigRepository,
  applicationStatsRepository
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

export const getApplications = cache((params?: ListParams) => 
  applicationsRepository.list(params)
);

export const getApplicationById = cache((id: string | number) => 
  applicationsRepository.getById(id)
);

export const getActiveApplications = cache(() => 
  applicationsRepository.getActive()
);

// --- IApplication-IModule Relationships Queries ---------------------------------

export const getApplicationModules = cache((params?: ListParams) => 
  applicationModulesRepository.list(params)
);

export const getApplicationModuleById = cache((applicationId: string | number, moduleId: string | number) => 
  applicationModulesRepository.getById(applicationId, moduleId)
);

export const getModulesByApplication = cache((applicationId: string | number) => 
  applicationModulesRepository.getModulesByApplication(applicationId)
);

export const getApplicationsByModule = cache((moduleId: string | number) => 
  applicationModulesRepository.getApplicationsByModule(moduleId)
);

// --- IApplication Health Queries ---------------------------------------------

export const checkApplicationHealth = cache((applicationId: string | number) => 
  applicationHealthRepository.checkHealth(applicationId)
);

export const checkAllApplicationsHealth = cache(() => 
  applicationHealthRepository.checkAllHealth()
);

export const getHealthHistory = cache((applicationId: string | number, params?: ListParams) => 
  applicationHealthRepository.getHealthHistory(applicationId, params)
);

// --- IApplication Configuration Queries -------------------------------------

export const getApplicationConfigs = cache((applicationId: string | number, params?: ListParams) => 
  applicationConfigRepository.list(applicationId, params)
);

export const getApplicationConfigByKey = cache((applicationId: string | number, key: string) => 
  applicationConfigRepository.getByKey(applicationId, key)
);

// --- IApplication Statistics Queries -----------------------------------------

export const getApplicationStats = cache((applicationId: string | number) => 
  applicationStatsRepository.getStats(applicationId)
);

export const getAllApplicationsStats = cache(() => 
  applicationStatsRepository.getAllStats()
);

export const getApplicationOverview = cache((applicationId: string | number) => 
  applicationStatsRepository.getOverview(applicationId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get application with all relationships
export const getApplicationProfile = cache(async (applicationId: string | number) => {
  const [application, modules, health, stats, configs] = await Promise.all([
    getApplicationById(applicationId),
    getModulesByApplication(applicationId),
    checkApplicationHealth(applicationId),
    getApplicationStats(applicationId),
    getApplicationConfigs(applicationId)
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
export const getApplicationsDashboard = cache(async () => {
  const [applications, allHealth, allStats] = await Promise.all([
    getApplications({ per_page: 100 }),
    checkAllApplicationsHealth(),
    getAllApplicationsStats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = applications.data.map(app => {
    const health = allHealth.results.find(h => h.application.id === app.id);
    const stats = allStats.find(s => s.application_id === app.id);
    
    return {
      ...app,
      health: health?.health,
      stats: stats || {
        application_id: app.id,
        total_users: 0,
        active_sessions: 0,
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
export const getApplicationHealthTrends = cache(async (applicationId: string | number, days: number = 7) => {
  const [healthHistory] = await Promise.all([
    getHealthHistory(applicationId, { per_page: days * 24 }) // Assuming hourly checks
  ]);
  
  // Process health data for trends
  const trends = healthHistory.data.map(health => ({
    timestamp: health.last_checked,
    status: health.status,
    response_time: health.response_time
  }));
  
  return {
    application_id: applicationId,
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
export const getApplicationsByStatus = cache(async (status: 'active' | 'inactive' | 'maintenance') => {
  const applications = await getApplications({ per_page: 100 });
  
  const filteredApps = applications.data.filter(app => app.status === status);
  
  return {
    applications: filteredApps,
    status,
    count: filteredApps.length
  };
});
