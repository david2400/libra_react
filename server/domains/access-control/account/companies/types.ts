import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- ICompany Types -------------------------------------------------------------

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
  phone?: string;
  email?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateCompanyPayload {
  name: string;
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface IUpdateCompanyPayload {
  name?: string;
  description?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

// --- Client Types (for company management) -----------------------------------

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

// --- ICompany-Client Relationships Types -----------------------------------

export interface ICompanyClient {
  companyId: string | number;
  clientId: string | number;
  isPrimary?: boolean;
  relationshipType?: string;
  company?: ICompany;
  client?: IClient;
}

export interface ICreateCompanyClientPayload {
  companyId: string | number;
  clientId: string | number;
  isPrimary?: boolean;
  relationshipType?: string;
}

export interface IUpdateCompanyClientPayload {
  isPrimary?: boolean;
  relationshipType?: string;
}

// --- ICompany Statistics Types ---------------------------------------------

export interface ICompanyStats {
  companyId: string | number;
  total_clients: number;
  active_clients: number;
  totalUsers: number;
  activeSessions: number;
  revenue?: number;
  lastActivity: string;
  createdAt?: string;
}

export interface ICompanyOverview {
  company: ICompany;
  clients: IClient[];
  stats: ICompanyStats;
  primary_clients: IClient[];
}

// --- ICompany Activity Types -------------------------------------------------

export interface ICompanyActivity {
  id: string | number;
  companyId: string | number;
  activityType: 'client_added' | 'client_removed' | 'profile_update' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ICompanyActivityFilter {
  companyId?: string | number;
  activityType?: string;
  startDate?: string;
  endDate?: string;
}

// --- ICompany Configuration Types ---------------------------------------------

export interface ICompanyConfig {
  companyId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateCompanyConfigPayload {
  companyId: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

export interface IUpdateCompanyConfigPayload {
  value?: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

// --- ICompany Health Types -------------------------------------------------

export interface ICompanyHealth {
  companyId: string | number;
  status: 'healthy' | 'warning' | 'critical';
  metrics: {
    client_activity_rate: number;
    user_engagement: number;
    system_performance: number;
  };
  last_checked: string;
  issues?: string[];
}

export interface ICompanyHealthResponse {
  company: ICompany;
  health: ICompanyHealth;
}
