import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Client Types -------------------------------------------------------------

export interface IClient {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateClientPayload {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface IUpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
}

// --- ICompany Types (for client management) ----------------------------------

export interface ICompany {
  id: string | number;
  name: string;
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Client-ICompany Relationships Types ---------------------------------------

export interface IClientCompany {
  clientId: string | number;
  companyId: string | number;
  isPrimary?: boolean;
  relationshipType?: string;
  client?: IClient;
  company?: ICompany;
}

export interface ICreateClientCompanyPayload {
  clientId: string | number;
  companyId: string | number;
  isPrimary?: boolean;
  relationshipType?: string;
}

export interface IUpdateClientCompanyPayload {
  isPrimary?: boolean;
  relationshipType?: string;
}

// --- Client Authentication Types ---------------------------------------------

export interface IClientAuth {
  clientId: string | number;
  username: string;
  passwordHash?: string;
  lastLogin?: string;
  isActive?: boolean;
  loginAttempts?: number;
  lockedUntil?: string;
}

export interface IClientLoginRequest {
  username: string;
  password: string;
}

export interface IClientLoginResponse {
  token: string;
  refreshToken?: string;
  client: IClient;
  expiresIn?: number;
}

export interface IClientRefreshTokenRequest {
  refreshToken: string;
}

export interface IClientRefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// --- Client Statistics Types ---------------------------------------------

export interface IClientStats {
  clientId: string | number;
  totalUsers: number;
  activeSessions: number;
  loginCount: number;
  lastActivity: string;
  createdAt?: string;
}

export interface IClientOverview {
  client: IClient;
  companies: ICompany[];
  stats: IClientStats;
  primaryCompany?: ICompany;
}

// --- Client Activity Types -------------------------------------------------

export interface IClientActivity {
  id: string | number;
  clientId: string | number;
  activityType: 'login' | 'logout' | 'password_change' | 'profile_update' | 'other';
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface IClientActivityFilter {
  clientId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}
