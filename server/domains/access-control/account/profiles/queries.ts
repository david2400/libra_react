import 'server-only';
import { cache } from 'react';

import { 
  profilesRepository, 
  profilePreferencesRepository,
  profileActivityRepository,
  profileStatsRepository,
  profileSecurityRepository
} from './repository';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { 
  IProfile, 
  IUser,
  IProfilePreferences,
  IProfileActivity,
  IProfileActivityFilter,
  IProfileStats,
  IProfileOverview,
  IProfileSecurity
} from './types';

// --- Profiles Queries ---------------------------------------------------------

export const getProfiles = cache((params?: ListParams) => 
  profilesRepository.list(params)
);

export const getProfileById = cache((id: string | number) => 
  profilesRepository.getById(id)
);

export const getProfileByUserId = cache((userId: string | number) => 
  profilesRepository.getByUserId(userId)
);

// --- IProfile Preferences Queries ---------------------------------------------

export const getProfilePreferences = cache((profileId: string | number) => 
  profilePreferencesRepository.get(profileId)
);

// --- IProfile Activity Queries ---------------------------------------------

export const getProfileActivities = cache((params?: ListParams) => 
  profileActivityRepository.list(params)
);

export const getActivitiesByProfile = cache((profileId: string | number, params?: ListParams) => 
  profileActivityRepository.getByProfile(profileId, params)
);

export const getRecentProfileActivities = cache((profileId: string | number, limit?: number) => 
  profileActivityRepository.getRecent(profileId, limit)
);

// --- IProfile Statistics Queries ---------------------------------------------

export const getProfileStats = cache((profileId: string | number) => 
  profileStatsRepository.getStats(profileId)
);

export const getAllProfilesStats = cache(() => 
  profileStatsRepository.getAllStats()
);

export const getProfileOverview = cache((profileId: string | number) => 
  profileStatsRepository.getOverview(profileId)
);

// --- IProfile Security Queries ---------------------------------------------

export const getProfileSecurity = cache((profileId: string | number) => 
  profileSecurityRepository.getSecurity(profileId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get profile with all related data
export const getCompleteProfile = cache(async (profileId: string | number) => {
  const [profile, preferences, stats, security, recentActivities] = await Promise.all([
    getProfileById(profileId),
    getProfilePreferences(profileId),
    getProfileStats(profileId),
    getProfileSecurity(profileId),
    getRecentProfileActivities(profileId, 10)
  ]);
  
  return {
    profile,
    preferences,
    stats,
    security,
    recent_activities: recentActivities
  };
});

// Get profile by user with all related data
export const getCompleteProfileByUser = cache(async (userId: string | number) => {
  const [profile, preferences, stats, security, recentActivities] = await Promise.all([
    getProfileByUserId(userId),
    getProfileByUserId(userId).then(p => p ? getProfilePreferences(p.id) : null),
    getProfileByUserId(userId).then(p => p ? getProfileStats(p.id) : null),
    getProfileByUserId(userId).then(p => p ? getProfileSecurity(p.id) : null),
    getProfileByUserId(userId).then(p => p ? getRecentProfileActivities(p.id, 10) : [])
  ]);
  
  if (!profile) {
    return null;
  }
  
  return {
    profile,
    preferences,
    stats,
    security,
    recent_activities: recentActivities
  };
});

// Get profiles dashboard data
export const getProfilesDashboard = cache(async () => {
  const [profiles, allStats] = await Promise.all([
    getProfiles({ per_page: 100 }),
    getAllProfilesStats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = profiles.data.map(profile => {
    const stats = allStats.find(s => s.profile_id === profile.id);
    
    return {
      ...profile,
      stats: stats || {
        profile_id: profile.id,
        login_count: 0,
        profile_updates: 0,
        preference_changes: 0,
        created_at: profile.created_at || ''
      }
    };
  });
  
  return {
    profiles: dashboardData,
    summary: {
      total_profiles: profiles.meta.total,
      total_logins: allStats.reduce((sum, s) => sum + s.login_count, 0),
      total_profile_updates: allStats.reduce((sum, s) => sum + s.profile_updates, 0),
      total_preference_changes: allStats.reduce((sum, s) => sum + s.preference_changes, 0),
      active_profiles: dashboardData.filter(p => p.is_active).length
    }
  };
});

// Get profile activity trends
export const getProfileActivityTrends = cache(async (profileId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    getActivitiesByProfile(profileId, { per_page: days * 24 }) // Assuming hourly checks
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
    profile_id: profileId,
    trends: groupedTrends,
    summary: {
      total_activities: trends.length,
      activity_types: Object.keys(groupedTrends),
      most_common_activity: Object.entries(groupedTrends)
        .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || 'none'
    }
  };
});

// Get profiles by theme preference
export const getProfilesByTheme = cache(async (theme: 'light' | 'dark' | 'auto') => {
  const profiles = await getProfiles({ per_page: 100 });
  
  const filteredProfiles = profiles.data.filter(profile => profile.theme === theme);
  
  return {
    theme,
    profiles: filteredProfiles,
    count: filteredProfiles.length
  };
});

// Get profiles by language preference
export const getProfilesByLanguage = cache(async (language: string) => {
  const profiles = await getProfiles({ per_page: 100 });
  
  const filteredProfiles = profiles.data.filter(profile => profile.language === language);
  
  return {
    language,
    profiles: filteredProfiles,
    count: filteredProfiles.length
  };
});

// Get profile security overview
export const getProfileSecurityOverview = cache(async (profileId: string | number) => {
  const [profile, security, stats] = await Promise.all([
    getProfileById(profileId),
    getProfileSecurity(profileId),
    getProfileStats(profileId)
  ]);
  
  return {
    profile_id: profileId,
    profile_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
    security: {
      two_factor_enabled: security.two_factor_enabled,
      trusted_devices_count: security.trusted_devices.length,
      failed_login_attempts: security.failed_login_attempts,
      account_locked: !!security.account_locked_until,
      last_password_change: security.last_password_change,
      password_strength: 'medium' // This would be calculated based on actual password
    },
    stats: {
      login_count: stats.login_count,
      last_login: stats.last_login,
      profile_updates: stats.profile_updates
    },
    security_score: calculateSecurityScore(security, stats)
  };
});

// Helper function to calculate security score
function calculateSecurityScore(security: IProfileSecurity, stats: IProfileStats): number {
  let score = 0;
  
  // Two-factor authentication (30 points)
  if (security.two_factor_enabled) score += 30;
  
  // Recent password change (20 points)
  if (security.last_password_change) {
    const lastChange = new Date(security.last_password_change);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (lastChange >= thirtyDaysAgo) score += 20;
  }
  
  // Low failed login attempts (20 points)
  if (security.failed_login_attempts <= 3) score += 20;
  
  // Trusted devices management (15 points)
  if (security.trusted_devices.length <= 5) score += 15;
  
  // Regular profile updates (15 points)
  if (stats.profile_updates > 0) score += 15;
  
  return Math.min(score, 100);
}

// Get profiles with security issues
export const getProfilesWithSecurityIssues = cache(async () => {
  const [profiles, allStats] = await Promise.all([
    getProfiles({ per_page: 100 }),
    getAllProfilesStats()
  ]);
  
  const profilesWithSecurity = await Promise.all(
    profiles.data.map(async (profile) => {
      const [security, stats] = await Promise.all([
        getProfileSecurity(profile.id),
        getProfileStats(profile.id)
      ]);
      
      const issues = [];
      
      if (!security.two_factor_enabled) {
        issues.push('Two-factor authentication not enabled');
      }
      
      if (security.failed_login_attempts > 5) {
        issues.push('High number of failed login attempts');
      }
      
      if (security.account_locked_until) {
        issues.push('Account is currently locked');
      }
      
      if (!security.last_password_change || 
          new Date(security.last_password_change) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
        issues.push('Password not changed in last 90 days');
      }
      
      return {
        ...profile,
        security_issues: issues,
        security_score: calculateSecurityScore(security, stats)
      };
    })
  );
  
  const withIssues = profilesWithSecurity.filter(p => p.security_issues.length > 0);
  
  return {
    profiles: withIssues,
    total_with_issues: withIssues.length,
    total_profiles: profiles.data.length,
    percentage_with_issues: (withIssues.length / profiles.data.length) * 100
  };
});
