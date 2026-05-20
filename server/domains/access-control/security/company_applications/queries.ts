import 'server-only';
import { cache } from 'react';

import {
  companyApplicationsRepository,
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Company Applications Queries -----------------------------------------------

export const getCompanyApplications = cache((params?: ListParams) => 
  companyApplicationsRepository.list(params)
);

export const getCompanyApplicationById = cache((id: string | number) =>
  companyApplicationsRepository.getById(id)
);

export const getActiveCompanyApplications = cache(() =>
  companyApplicationsRepository.list({ filter: 'active' })
);

// --- Company-specific Queries -------------------------------------------------

export const getApplicationsByCompany = cache((companyId: string | number) =>
  companyApplicationsRepository.getByCompany(companyId)
);

export const getActiveApplicationsByCompany = cache((companyId: string | number) =>
  companyApplicationsRepository.getActiveByCompany(companyId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get company application with full details
export const getCompanyApplicationProfile = cache(async (id: string | number) => {
  const companyApplication = await getCompanyApplicationById(id);
  return {
    companyApplication,
    licenseStatus: companyApplication?.is_active ? 'active' : 'inactive',
    licenseValid: companyApplication?.license_start_date && companyApplication?.license_end_date
      ? new Date(companyApplication.license_end_date) > new Date()
      : false,
  };
});

// Get company's application portfolio
export const getCompanyApplicationPortfolio = cache(async (companyId: string | number) => {
  const [allApplications, activeApplications] = await Promise.all([
    getApplicationsByCompany(companyId),
    getActiveApplicationsByCompany(companyId)
  ]);

  return {
    companyId,
    totalApplications: allApplications.length,
    activeApplications: activeApplications.length,
    inactiveApplications: allApplications.length - activeApplications.length,
    applications: allApplications,
    activeApplicationsList: activeApplications,
  };
});

// Get license expirations for company
export const getCompanyLicenseExpirations = cache(async (companyId: string | number, days: number = 30) => {
  const applications = await getApplicationsByCompany(companyId);
  const today = new Date();
  const expirationThreshold = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));

  const expiringSoon = applications.filter(app => {
    if (!app.license_end_date) return false;
    const endDate = new Date(app.license_end_date);
    return endDate <= expirationThreshold && endDate > today;
  });

  const expired = applications.filter(app => {
    if (!app.license_end_date) return false;
    return new Date(app.license_end_date) <= today;
  });

  return {
    companyId,
    expiringSoon: expiringSoon.map(app => ({
      ...app,
      daysUntilExpiration: Math.ceil((new Date(app.license_end_date!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    })),
    expired,
    totalExpiring: expiringSoon.length + expired.length,
  };
});

// Get application usage statistics
export const getApplicationUsageStats = cache(async (applicationId: string | number) => {
  // This would typically call a separate endpoint for usage stats
  // For now, returning a placeholder structure
  return {
    applicationId,
    totalCompanies: 0, // Would be calculated from actual data
    activeLicenses: 0,
    totalUsers: 0,
    averageUserLimit: 0,
  };
});

// Get company application health status
export const getCompanyApplicationHealth = cache(async (companyId: string | number) => {
  const portfolio = await getCompanyApplicationPortfolio(companyId);

  const healthStatus = {
    healthy: portfolio.activeApplications > 0,
    issues: [] as string[],
    recommendations: [] as string[]
  };

  // Check for expired licenses
  if (portfolio.inactiveApplications > 0) {
    healthStatus.issues.push(`${portfolio.inactiveApplications} inactive licenses`);
    healthStatus.recommendations.push('Review and renew expired licenses');
  }

  // Check for licenses expiring soon
  const expiringSoon = await getCompanyLicenseExpirations(companyId, 30);
  if (expiringSoon.totalExpiring > 0) {
    healthStatus.issues.push(`${expiringSoon.totalExpiring} licenses expiring soon`);
    healthStatus.recommendations.push('Plan license renewals in advance');
  }

  return {
    ...portfolio,
    health: healthStatus,
  };
});
