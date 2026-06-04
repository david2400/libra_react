import 'server-only';
import { cache } from 'react';

import {
  userApplicationsRepository,
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- User Applications Queries -----------------------------------------------

export const getUserApplications = cache((params?: ListParams) => 
  userApplicationsRepository.list(params)
);

export const getUserApplicationById = cache((id: string | number) =>
  userApplicationsRepository.getById(id)
);

export const getActiveUserApplications = cache(() =>
  userApplicationsRepository.list({ filter: 'active' })
);

// --- User-specific Queries -------------------------------------------------

export const getApplicationsByUser = cache((userId: string | number) =>
  userApplicationsRepository.getByUser(userId)
);

export const getActiveApplicationsByUser = cache((userId: string | number) =>
  userApplicationsRepository.getActiveByUser(userId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get user application with full details
export const getUserApplicationProfile = cache(async (id: string | number) => {
  const userApplication = await getUserApplicationById(id);
  return {
    userApplication,
    licenseStatus: userApplication?.is_active ? 'active' : 'inactive',
    licenseValid: userApplication?.license_start_date && userApplication?.license_end_date
      ? new Date(userApplication.license_end_date) > new Date()
      : false,
  };
});

// Get user's application portfolio
export const getUserApplicationPortfolio = cache(async (userId: string | number) => {
  const [allApplications, activeApplications] = await Promise.all([
    getApplicationsByUser(userId),
    getActiveApplicationsByUser(userId)
  ]);

  return {
    userId,
    totalApplications: allApplications.length,
    activeApplications: activeApplications.length,
    inactiveApplications: allApplications.length - activeApplications.length,
    applications: allApplications,
    activeApplicationsList: activeApplications,
  };
});

// Get license expirations for user
export const getUserLicenseExpirations = cache(async (userId: string | number, days: number = 30) => {
  const applications = await getApplicationsByUser(userId);
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
    userId,
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
    totalUsers: 0, // Would be calculated from actual data
    activeLicenses: 0,
    averageAccessLevel: '',
  };
});

// Get user application health status
export const getUserApplicationHealth = cache(async (userId: string | number) => {
  const portfolio = await getUserApplicationPortfolio(userId);

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
  const expiringSoon = await getUserLicenseExpirations(userId, 30);
  if (expiringSoon.totalExpiring > 0) {
    healthStatus.issues.push(`${expiringSoon.totalExpiring} licenses expiring soon`);
    healthStatus.recommendations.push('Plan license renewals in advance');
  }

  return {
    ...portfolio,
    health: healthStatus,
  };
});
