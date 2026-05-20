import 'server-only';
import { cache } from 'react';

import { 
  companiesRepository, 
  companyClientsRepository,
  companyStatsRepository,
  companyActivityRepository,
  companyConfigRepository,
  companyHealthRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
// import type { 
//   ICompany, 
//   ICompanyClient,
//   ICompanyStats,
//   ICompanyOverview,
//   ICompanyActivity,
//   ICompanyActivityFilter,
//   ICompanyConfig,
//   ICompanyHealth,
//   ICompanyHealthResponse
// } from './types';

// --- Companies Queries ---------------------------------------------------------

export const getCompanies = cache((params?: ListParams) => 
  companiesRepository.list(params)
);

export const getCompanyById = cache((id: string | number) => 
  companiesRepository.getById(id)
);

export const getActiveCompanies = cache(() => 
  companiesRepository.getActive()
);

// --- ICompany-Client Relationships Queries ---------------------------------

export const getCompanyClients = cache((params?: ListParams) => 
  companyClientsRepository.list(params)
);

export const getCompanyClientById = cache((companyId: string | number, clientId: string | number) => 
  companyClientsRepository.getById(companyId, clientId)
);

export const getClientsByCompany = cache((companyId: string | number) => 
  companyClientsRepository.getClientsByCompany(companyId)
);

export const getCompaniesByClient = cache((clientId: string | number) => 
  companyClientsRepository.getCompaniesByClient(clientId)
);

export const getPrimaryClientsForCompany = cache((companyId: string | number) => 
  companyClientsRepository.getPrimaryClients(companyId)
);

// --- ICompany Statistics Queries ---------------------------------------------

export const getCompanyStats = cache((companyId: string | number) => 
  companyStatsRepository.getStats(companyId)
);

export const getAllCompaniesStats = cache(() => 
  companyStatsRepository.getAllStats()
);

export const getCompanyOverview = cache((companyId: string | number) => 
  companyStatsRepository.getOverview(companyId)
);

// --- ICompany Activity Queries ---------------------------------------------

export const getCompanyActivities = cache((params?: ListParams) => 
  companyActivityRepository.list(params)
);

export const getActivitiesByCompany = cache((companyId: string | number, params?: ListParams) => 
  companyActivityRepository.getByCompany(companyId, params)
);

export const getRecentCompanyActivities = cache((companyId: string | number, limit?: number) => 
  companyActivityRepository.getRecent(companyId, limit)
);

// --- ICompany Configuration Queries -----------------------------------------

export const getCompanyConfigs = cache((companyId: string | number, params?: ListParams) => 
  companyConfigRepository.list(companyId, params)
);

export const getCompanyConfigByKey = cache((companyId: string | number, key: string) => 
  companyConfigRepository.getByKey(companyId, key)
);

// --- ICompany Health Queries ---------------------------------------------

export const checkCompanyHealth = cache((companyId: string | number) => 
  companyHealthRepository.checkHealth(companyId)
);

export const checkAllCompaniesHealth = cache(() => 
  companyHealthRepository.checkAllHealth()
);

export const getCompanyHealthHistory = cache((companyId: string | number, params?: ListParams) => 
  companyHealthRepository.getHealthHistory(companyId, params)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get company with all relationships
export const getCompanyProfile = cache(async (companyId: string | number) => {
  const [company, clients, stats, primaryClients, recentActivities, configs] = await Promise.all([
    getCompanyById(companyId),
    getClientsByCompany(companyId),
    getCompanyStats(companyId),
    getPrimaryClientsForCompany(companyId),
    getRecentCompanyActivities(companyId, 5),
    getCompanyConfigs(companyId)
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
export const getCompaniesDashboard = cache(async () => {
  const [companies, allStats, allHealth] = await Promise.all([
    getCompanies({ per_page: 100 }),
    getAllCompaniesStats(),
    checkAllCompaniesHealth()
  ]);
  
  // Combine data for dashboard
  const dashboardData = companies.data.map(company => {
    const stats = allStats.find(s => s.company_id === company.id_company);
    const health = allHealth.find(h => h.company.id_company === company.id_company);
    
    return {
      ...company,
      stats: stats || {
        company_id: company.id_company,
        total_clients: 0,
        active_clients: 0,
        total_users: 0,
        active_sessions: 0,
        last_activity: company.created_at || '',
        created_at: company.created_at || ''
      },
      health: health?.health
    };
  });
  
  return {
    companies: dashboardData,
    summary: {
      total_companies: companies.meta.total,
      total_clients: allStats.reduce((sum, s) => sum + s.total_clients, 0),
      total_users: allStats.reduce((sum, s) => sum + s.total_users, 0),
      healthy_companies: allHealth.filter(h => h.health.status === 'healthy').length,
      warning_companies: allHealth.filter(h => h.health.status === 'warning').length,
      critical_companies: allHealth.filter(h => h.health.status === 'critical').length
    }
  };
});

// Get company activity trends
export const getCompanyActivityTrends = cache(async (companyId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    getActivitiesByCompany(companyId, { perPage: days * 24 }) // Assuming hourly checks
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
// export const getCompaniesByIndustry = cache(async (industry: string) => {
//   const companies = await getCompanies({ perPage: 100 });
  
//   const filteredCompanies = companies.data.filter(company => company.industry === industry);
  
//   return {
//     industry,
//     companies: filteredCompanies,
//     count: filteredCompanies.length
//   };
// });

// Get companies by size
// export const getCompaniesBySize = cache(async (size: 'small' | 'medium' | 'large' | 'enterprise') => {
//   const companies = await getCompanies({ perPage: 100 });
  
//   const filteredCompanies = companies.data.filter(company => company.size === size);
  
//   return {
//     size,
//     companies: filteredCompanies,
//     count: filteredCompanies.length
//   };
// });

// Get company performance metrics
export const getCompanyPerformanceMetrics = cache(async (companyId: string | number) => {
  const [company, stats, health, activities] = await Promise.all([
    getCompanyById(companyId),
    getCompanyStats(companyId),
    checkCompanyHealth(companyId),
    getActivitiesByCompany(companyId, { perPage: 100 })
  ]);
  
  // Calculate performance metrics
  const clientGrowthRate = stats.total_clients > 0 ? (stats.active_clients / stats.total_clients) * 100 : 0;
  const userEngagementRate = stats.total_users > 0 ? (stats.active_sessions / stats.total_users) * 100 : 0;
  
  const recentActivities = activities.data.filter(a => {
    const activityDate = new Date(a.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return activityDate >= thirtyDaysAgo;
  });
  
  return {
    company_id: companyId,
    company_name: company.name,
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
