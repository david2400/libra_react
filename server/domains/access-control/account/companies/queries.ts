import 'server-only';
import { cache } from 'react';

import { 
  companiesRepository, 
  company_clients_repository,
  company_stats_repository,
  company_activity_repository,
  company_config_repository,
  company_health_repository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  ICompany, 
  IClient,
  ICompanyClient,
  ICompanyStats,
  ICompanyOverview,
  ICompanyActivity,
  ICompanyActivityFilter,
  ICompanyConfig,
  ICompanyHealth,
  ICompanyHealthResponse
} from './types';

// --- Companies Queries ---------------------------------------------------------

export const get_companies = cache((params?: ListParams) => 
  companiesRepository.list(params)
);

export const get_company_by_id = cache((id: string | number) => 
  companiesRepository.getById(id)
);

export const get_active_companies = cache(() => 
  companiesRepository.getActive()
);

// --- ICompany-Client Relationships Queries ---------------------------------

export const get_company_clients = cache((params?: ListParams) => 
  company_clients_repository.list(params)
);

export const get_company_client_by_id = cache((companyId: string | number, clientId: string | number) => 
  company_clients_repository.getById(companyId, clientId)
);

export const get_clients_by_company = cache((companyId: string | number) => 
  company_clients_repository.get_clients_by_company(companyId)
);

export const get_companies_by_client = cache((clientId: string | number) => 
  company_clients_repository.get_companies_by_client(clientId)
);

export const get_primary_clients_for_company = cache((companyId: string | number) => 
  company_clients_repository.get_primary_clients(companyId)
);

// --- ICompany Statistics Queries ---------------------------------------------

export const get_company_stats = cache((companyId: string | number) => 
  company_stats_repository.getStats(companyId)
);

export const get_all_companies_stats = cache(() => 
  company_stats_repository.get_all_stats()
);

export const get_company_overview = cache((companyId: string | number) => 
  company_stats_repository.getOverview(companyId)
);

// --- ICompany Activity Queries ---------------------------------------------

export const get_company_activities = cache((params?: ListParams) => 
  company_activity_repository.list(params)
);

export const get_activities_by_company = cache((companyId: string | number, params?: ListParams) => 
  company_activity_repository.get_by_company(companyId, params)
);

export const get_recent_company_activities = cache((companyId: string | number, limit?: number) => 
  company_activity_repository.getRecent(companyId, limit)
);

// --- ICompany Configuration Queries -----------------------------------------

export const get_company_configs = cache((companyId: string | number, params?: ListParams) => 
  company_config_repository.list(companyId, params)
);

export const get_company_config_by_key = cache((companyId: string | number, key: string) => 
  company_config_repository.get_by_key(companyId, key)
);

// --- ICompany Health Queries ---------------------------------------------

export const check_company_health = cache((companyId: string | number) => 
  company_health_repository.check_health(companyId)
);

export const check_all_companies_health = cache(() => 
  company_health_repository.check_all_health()
);

export const get_company_health_history = cache((companyId: string | number, params?: ListParams) => 
  company_health_repository.get_health_history(companyId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get company with all relationships
export const get_company_profile = cache(async (companyId: string | number) => {
  const [company, clients, stats, primaryClients, recentActivities, configs] = await Promise.all([
    get_company_by_id(companyId),
    get_clients_by_company(companyId),
    get_company_stats(companyId),
    get_primary_clients_for_company(companyId),
    get_recent_company_activities(companyId, 5),
    get_company_configs(companyId)
  ]);
  
  return {
    company,
    clients,
    stats,
    primary_clients: primaryClients,
    recent_activities: recentActivities,
    configs: configs.data,
    config_count: configs.meta.total
  };
});

// Get companies dashboard data
export const get_companies_dashboard = cache(async () => {
  const [companies, allStats, allHealth] = await Promise.all([
    get_companies({ per_page: 100 }),
    get_all_companies_stats(),
    check_all_companies_health()
  ]);
  
  // Combine data for dashboard
  const dashboardData = companies.data.map(company => {
    const stats = allStats.find(s => s.companyId === company.id);
    const health = allHealth.find(h => h.company.id === company.id);
    
    return {
      ...company,
      stats: stats || {
        companyId: company.id,
        total_clients: 0,
        active_clients: 0,
        totalUsers: 0,
        activeSessions: 0,
        lastActivity: company.createdAt || ''
      },
      health: health?.health
    };
  });
  
  return {
    companies: dashboardData,
    summary: {
      total_companies: companies.meta.total,
      total_clients: allStats.reduce((sum, s) => sum + s.total_clients, 0),
      totalUsers: allStats.reduce((sum, s) => sum + s.totalUsers, 0),
      healthy_companies: allHealth.filter(h => h.health.status === 'healthy').length,
      warning_companies: allHealth.filter(h => h.health.status === 'warning').length,
      critical_companies: allHealth.filter(h => h.health.status === 'critical').length
    }
  };
});

// Get company activity trends
export const get_company_activity_trends = cache(async (companyId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    get_activities_by_company(companyId, { per_page: days * 24 }) // Assuming hourly checks
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
    companyId: companyId,
    trends: groupedTrends,
    summary: {
      total_activities: trends.length,
      activity_types: Object.keys(groupedTrends),
      most_common_activity: Object.entries(groupedTrends)
        .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || 'none'
    }
  };
});

// Get companies by industry
export const get_companies_by_industry = cache(async (industry: string) => {
  const companies = await get_companies({ per_page: 100 });
  
  const filteredCompanies = companies.data.filter(company => company.industry === industry);
  
  return {
    industry,
    companies: filteredCompanies,
    count: filteredCompanies.length
  };
});

// Get companies by size
export const get_companies_by_size = cache(async (size: 'small' | 'medium' | 'large' | 'enterprise') => {
  const companies = await get_companies({ per_page: 100 });
  
  const filteredCompanies = companies.data.filter(company => company.size === size);
  
  return {
    size,
    companies: filteredCompanies,
    count: filteredCompanies.length
  };
});

// Get company performance metrics
export const get_company_performance_metrics = cache(async (companyId: string | number) => {
  const [company, stats, health, activities] = await Promise.all([
    get_company_by_id(companyId),
    get_company_stats(companyId),
    check_company_health(companyId),
    get_activities_by_company(companyId, { per_page: 100 })
  ]);
  
  // Calculate performance metrics
  const clientGrowthRate = stats.total_clients > 0 ? (stats.active_clients / stats.total_clients) * 100 : 0;
  const userEngagementRate = stats.totalUsers > 0 ? (stats.activeSessions / stats.totalUsers) * 100 : 0;
  
  const recentActivities = activities.data.filter(a => {
    const activityDate = new Date(a.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return activityDate >= thirtyDaysAgo;
  });
  
  return {
    companyId: companyId,
    companyName: company.name,
    metrics: {
      client_growth_rate: clientGrowthRate,
      user_engagement_rate: userEngagementRate,
      health_score: health.health.metrics,
      recent_activity_count: recentActivities.length,
      overall_score: (clientGrowthRate + userEngagementRate + (health.health.status === 'healthy' ? 100 : health.health.status === 'warning' ? 50 : 0)) / 3
    },
    health_status: health.health.status,
    last_updated: new Date().toISOString()
  };
});
