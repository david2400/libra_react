import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IProfile Types -------------------------------------------------------------

export interface IProfile {
  id: string | number;
  userId: string | number;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  theme?: 'light' | 'dark' | 'auto';
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateProfilePayload {
  userId: string | number;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  theme?: 'light' | 'dark' | 'auto';
}

export interface IUpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  date_format?: string;
  time_format?: '12h' | '24h';
  theme?: 'light' | 'dark' | 'auto';
  isActive?: boolean;
}

// --- IUser Types (for profile management) ---------------------------------

export interface IUser {
  id: string | number;
  email: string;
  user_name?: string;
  first_name?: string;
  last_name?: string;
  isActive?: boolean;
  roles?: any[];
  permissions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

// --- IProfile Preferences Types ---------------------------------------------

export interface IProfilePreferences {
  profile_id: string | number;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    show_email: boolean;
    show_phone: boolean;
    show_last_seen: boolean;
  };
  ui: {
    sidebar_collapsed: boolean;
    compact_mode: boolean;
    show_tooltips: boolean;
  };
  updatedAt?: string;
}

export interface IUpdateProfilePreferencesPayload {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    show_email?: boolean;
    show_phone?: boolean;
    show_last_seen?: boolean;
  };
  ui?: {
    sidebar_collapsed?: boolean;
    compact_mode?: boolean;
    show_tooltips?: boolean;
  };
}

// --- IProfile Activity Types ---------------------------------------------

export interface IProfileActivity {
  id: string | number;
  profile_id: string | number;
  activityType: 'login' | 'logout' | 'profile_update' | 'password_change' | 'preference_update' | 'other';
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IProfileActivityFilter {
  profile_id?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- IProfile Statistics Types ---------------------------------------------

export interface IProfileStats {
  profile_id: string | number;
  loginCount: number;
  lastLogin?: string;
  profile_updates: number;
  preference_changes: number;
  session_duration_avg?: number;
  total_session_time?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProfileOverview {
  profile: IProfile;
  user: IUser;
  preferences: IProfilePreferences;
  stats: IProfileStats;
  recent_activities: IProfileActivity[];
}

// --- IProfile Security Types ---------------------------------------------

export interface IProfileSecurity {
  profile_id: string | number;
  two_factor_enabled: boolean;
  two_factor_secret?: string;
  backup_codes?: string[];
  last_password_change?: string;
  failed_login_attempts: number;
  account_locked_until?: string;
  trusted_devices: Array<{
    id: string;
    name: string;
    userAgent: string;
    last_used: string;
    createdAt: string;
  }>;
}

export interface IEnableTwoFactorPayload {
  secret: string;
  backup_codes: string[];
}

export interface IVerifyTwoFactorPayload {
  code: string;
}

export interface IAddTrustedDevicePayload {
  name: string;
  userAgent: string;
}
