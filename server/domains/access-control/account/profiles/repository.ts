import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type {
  IProfile,
  ICreateProfile,
  IUpdateProfile,
  IProfilePreferences,
  IUpdateProfilePreferencesPayload,
  IProfileActivity,
  IProfileActivityFilter,
  IProfileStats,
  IProfileOverview,
  IProfileSecurity,
  IEnableTwoFactorPayload,
  IVerifyTwoFactorPayload,
  IAddTrustedDevicePayload
} from './types';
import type { IUser } from '../users';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Profiles Repository -----------------------------------------------------

export const profilesRepository = {
  // List profiles
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IProfile>>('/api/access_control/profiles', {
      params,
      revalidate: 120,
      tags: [accessControlTags.profiles()],
    }),

  // Get profile by ID
  getById: (id: string | number) => 
    serverFetch.get<IProfile>(`/api/access_control/profiles/${id}`, {
      revalidate: 300,
      tags: [accessControlTags.profile(id)],
    }),

  // Get profile by user ID
  getByUserId: (userId: string | number) => 
    serverFetch.get<IProfile>(`/api/access_control/profiles/user/${userId}`, {
      revalidate: 300,
      tags: [accessControlTags.user(userId)],
    }),

  // Create profile
  create: (payload: ICreateProfile) => 
    serverFetch.post<IProfile>('/api/access_control/profiles', payload, {
      revalidate: false,
    }),

  // Update profile
  update: (id: string | number, payload: IUpdateProfile) => 
    serverFetch.put<IProfile>(`/api/access_control/profiles/${id}`, payload, {
      revalidate: false,
    }),

  // Delete profile
  delete: (id: string | number) => 
    serverFetch.delete<void>(`/api/access_control/profiles/${id}`, {
      revalidate: false,
    }),
} as const;

// --- IProfile Preferences Repository -----------------------------------------

export const profilePreferencesRepository = {
  // Get profile preferences
  get: (profileId: string | number) => 
    serverFetch.get<IProfilePreferences>(`/api/access_control/profiles/${profileId}/preferences`, {
      revalidate: 300,
      tags: [accessControlTags.profile(profileId)],
    }),

  // Update profile preferences
  update: (profileId: string | number, payload: IUpdateProfilePreferencesPayload) => 
    serverFetch.put<IProfilePreferences>(`/api/access_control/profiles/${profileId}/preferences`, payload, {
      revalidate: false,
    }),

  // Reset profile preferences to defaults
  reset: (profileId: string | number) => 
    serverFetch.post<IProfilePreferences>(`/api/access_control/profiles/${profileId}/preferences/reset`, {}, {
      revalidate: false,
    }),
} as const;

// --- IProfile Activity Repository ---------------------------------------------

export const profileActivityRepository = {
  // List profile activities
  list: (params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IProfileActivity>>('/api/access_control/profile-activities', {
      params,
      revalidate: 120,
      tags: [accessControlTags.profiles()],
    }),

  // Get activities by profile
  getByProfile: (profileId: string | number, params?: ListParams) => 
    serverFetch.get<IPaginatedResponse<IProfileActivity>>(`/api/access_control/profile-activities/profile/${profileId}`, {
      params,
      revalidate: 120,
      tags: [accessControlTags.profile(profileId)],
    }),

  // Create activity log
  create: (activity: Omit<IProfileActivity, 'id' | 'created_at'>) => 
    serverFetch.post<IProfileActivity>('/api/access_control/profile-activities', activity, {
      revalidate: false,
    }),

  // Get recent activities
  getRecent: (profileId: string | number, limit: number = 10) => 
    serverFetch.get<IProfileActivity[]>(`/api/access_control/profile-activities/profile/${profileId}/recent`, {
      params: { limit },
      revalidate: 60,
      tags: [accessControlTags.profile(profileId)],
    }),
} as const;

// --- IProfile Statistics Repository -----------------------------------------

export const profileStatsRepository = {
  // Get profile statistics
  getStats: (profileId: string | number) => 
    serverFetch.get<IProfileStats>(`/api/access_control/profiles/${profileId}/stats`, {
      revalidate: 60,
      tags: [accessControlTags.profile(profileId)],
    }),

  // Get all profiles statistics
  getAllStats: () => 
    serverFetch.get<IProfileStats[]>('/api/access_control/profiles/stats/bulk', {
      revalidate: 60,
      tags: [accessControlTags.profiles()],
    }),

  // Get profile overview
  getOverview: (profileId: string | number) => 
    serverFetch.get<IProfileOverview>(`/api/access_control/profiles/${profileId}/overview`, {
      revalidate: 120,
      tags: [accessControlTags.profile(profileId)],
    }),
} as const;

// --- IProfile Security Repository -----------------------------------------

export const profileSecurityRepository = {
  // Get profile security settings
  getSecurity: (profileId: string | number) => 
    serverFetch.get<IProfileSecurity>(`/api/access_control/profiles/${profileId}/security`, {
      revalidate: 300,
      tags: [accessControlTags.profile(profileId)],
    }),

  // Enable two-factor authentication
  enableTwoFactor: (profileId: string | number, payload: IEnableTwoFactorPayload) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/2fa/enable`, payload, {
      revalidate: false,
    }),

  // Verify two-factor authentication
  verifyTwoFactor: (profileId: string | number, payload: IVerifyTwoFactorPayload) => 
    serverFetch.post<{ verified: boolean }>(`/api/access_control/profiles/${profileId}/security/2fa/verify`, payload, {
      revalidate: false,
    }),

  // Disable two-factor authentication
  disableTwoFactor: (profileId: string | number) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/2fa/disable`, {}, {
      revalidate: false,
    }),

  // Generate new backup codes
  generateBackupCodes: (profileId: string | number) => 
    serverFetch.post<{ backup_codes: string[] }>(`/api/access_control/profiles/${profileId}/security/backup-codes/generate`, {}, {
      revalidate: false,
    }),

  // Add trusted device
  addTrustedDevice: (profileId: string | number, payload: IAddTrustedDevicePayload) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/trusted-devices`, payload, {
      revalidate: false,
    }),

  // Remove trusted device
  removeTrustedDevice: (profileId: string | number, deviceId: string) => 
    serverFetch.delete<void>(`/api/access_control/profiles/${profileId}/security/trusted-devices/${deviceId}`, {
      revalidate: false,
    }),

  // Update last password change
  updatePasswordChange: (profileId: string | number) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/password-change`, {}, {
      revalidate: false,
    }),

  // Reset failed login attempts
  resetFailedAttempts: (profileId: string | number) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/reset-failed-attempts`, {}, {
      revalidate: false,
    }),

  // Lock account
  lockAccount: (profileId: string | number, durationHours: number = 24) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/lock`, { duration_hours: durationHours }, {
      revalidate: false,
    }),

  // Unlock account
  unlockAccount: (profileId: string | number) => 
    serverFetch.post<void>(`/api/access_control/profiles/${profileId}/security/unlock`, {}, {
      revalidate: false,
    }),
} as const;
