import 'server-only';
import { cache } from 'react';

import { 
  profilesRepository, 
  profile_preferences_repository,
  profile_activity_repository,
  profile_stats_repository,
  profile_security_repository
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

export const get_profiles = cache((params?: ListParams) => 
  profilesRepository.list(params)
);

export const get_profile_by_id = cache((id: string | number) => 
  profilesRepository.getById(id)
);

export const get_profile_by_user_id = cache((userId: string | number) => 
  profilesRepository.get_by_user_id(userId)
);

// --- IProfile Preferences Queries ---------------------------------------------

export const get_profile_preferences = cache((profileId: string | number) => 
  profile_preferences_repository.get(profileId)
);

// --- IProfile Activity Queries ---------------------------------------------

export const get_profile_activities = cache((params?: ListParams) => 
  profile_activity_repository.list(params)
);

export const get_activities_by_profile = cache((profileId: string | number, params?: ListParams) => 
  profile_activity_repository.get_by_profile(profileId, params)
);

export const get_recent_profile_activities = cache((profileId: string | number, limit?: number) => 
  profile_activity_repository.getRecent(profileId, limit)
);

// --- IProfile Statistics Queries ---------------------------------------------

export const get_profile_stats = cache((profileId: string | number) => 
  profile_stats_repository.getStats(profileId)
);

export const get_all_profiles_stats = cache(() => 
  profile_stats_repository.get_all_stats()
);

export const get_profile_overview = cache((profileId: string | number) => 
  profile_stats_repository.getOverview(profileId)
);

// --- IProfile Security Queries ---------------------------------------------

export const get_profile_security = cache((profileId: string | number) => 
  profile_security_repository.get_security(profileId)
);

// --- Composite Queries (BFF patterns) -------------------------------------------

// Get profile with all related data
export const get_complete_profile = cache(async (profileId: string | number) => {
  const [profile, preferences, stats, security, recentActivities] = await Promise.all([
    get_profile_by_id(profileId),
    get_profile_preferences(profileId),
    get_profile_stats(profileId),
    get_profile_security(profileId),
    get_recent_profile_activities(profileId, 10)
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
export const get_complete_profile_by_user = cache(async (userId: string | number) => {
  const [profile, preferences, stats, security, recentActivities] = await Promise.all([
    get_profile_by_user_id(userId),
    get_profile_by_user_id(userId).then(p => p ? get_profile_preferences(p.id) : null),
    get_profile_by_user_id(userId).then(p => p ? get_profile_stats(p.id) : null),
    get_profile_by_user_id(userId).then(p => p ? get_profile_security(p.id) : null),
    get_profile_by_user_id(userId).then(p => p ? get_recent_profile_activities(p.id, 10) : [])
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
export const get_profiles_dashboard = cache(async () => {
  const [profiles, allStats] = await Promise.all([
    get_profiles({ per_page: 100 }),
    get_all_profiles_stats()
  ]);
  
  // Combine data for dashboard
  const dashboardData = profiles.data.map(profile => {
    const stats = allStats.find(s => s.profile_id === profile.id);
    
    return {
      ...profile,
      stats: stats || {
        profile_id: profile.id,
        loginCount: 0,
        profile_updates: 0,
        preference_changes: 0,
        createdAt: profile.createdAt || ''
      }
    };
  });
  
  return {
    profiles: dashboardData,
    summary: {
      total_profiles: profiles.meta.total,
      total_logins: allStats.reduce((sum, s) => sum + s.loginCount, 0),
      total_profile_updates: allStats.reduce((sum, s) => sum + s.profile_updates, 0),
      total_preference_changes: allStats.reduce((sum, s) => sum + s.preference_changes, 0),
      active_profiles: dashboardData.filter(p => p.isActive).length
    }
  };
});

// Get profile activity trends
export const get_profile_activity_trends = cache(async (profileId: string | number, days: number = 7) => {
  const [activities] = await Promise.all([
    get_activities_by_profile(profileId, { per_page: days * 24 }) // Assuming hourly checks
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
export const get_profiles_by_theme = cache(async (theme: 'light' | 'dark' | 'auto') => {
  const profiles = await get_profiles({ per_page: 100 });
  
  const filteredProfiles = profiles.data.filter(profile => profile.theme === theme);
  
  return {
    theme,
    profiles: filteredProfiles,
    count: filteredProfiles.length
  };
});

// Get profiles by language preference
export const get_profiles_by_language = cache(async (language: string) => {
  const profiles = await get_profiles({ per_page: 100 });
  
  const filteredProfiles = profiles.data.filter(profile => profile.language === language);
  
  return {
    language,
    profiles: filteredProfiles,
    count: filteredProfiles.length
  };
});

// Get profile security overview
export const get_profile_security_overview = cache(async (profileId: string | number) => {
  const [profile, security, stats] = await Promise.all([
    get_profile_by_id(profileId),
    get_profile_security(profileId),
    get_profile_stats(profileId)
  ]);
  
  return {
    profile_id: profileId,
    profile_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.user_name || 'Unknown',
    security: {
      two_factor_enabled: security.two_factor_enabled,
      trusted_devices_count: security.trusted_devices.length,
      failed_login_attempts: security.failed_login_attempts,
      account_locked: !!security.account_locked_until,
      last_password_change: security.last_password_change,
      password_strength: 'medium' // This would be calculated based on actual password
    },
    stats: {
      loginCount: stats.loginCount,
      lastLogin: stats.lastLogin,
      profile_updates: stats.profile_updates
    },
    security_score: calculate_security_score(security, stats)
  };
});

// Helper function to calculate security score
function calculate_security_score(security: IProfileSecurity, stats: IProfileStats): number {
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
export const get_profiles_with_security_issues = cache(async () => {
  const [profiles, allStats] = await Promise.all([
    get_profiles({ per_page: 100 }),
    get_all_profiles_stats()
  ]);
  
  const profilesWithSecurity = await Promise.all(
    profiles.data.map(async (profile) => {
      const [security, stats] = await Promise.all([
        get_profile_security(profile.id),
        get_profile_stats(profile.id)
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
        security_score: calculate_security_score(security, stats)
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
