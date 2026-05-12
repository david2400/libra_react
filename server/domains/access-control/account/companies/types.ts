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
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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
  is_active?: boolean;
}

// --- Client Types (for company management) -----------------------------------

export interface IClient {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// --- ICompany-Client Relationships Types -----------------------------------

export interface ICompanyClient {
  company_id: string | number;
  client_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
  company?: ICompany;
  client?: IClient;
}

export interface ICreateCompanyClientPayload {
  company_id: string | number;
  client_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
}

export interface IUpdateCompanyClientPayload {
  company_id?: string | number;
  client_id?: string | number;
  is_primary?: boolean;
  relationship_type?: string;
}

// --- ICompany Statistics Types ---------------------------------------------

export interface ICompanyStats {
  company_id: string | number;
  total_clients: number;
  active_clients: number;
  total_users: number;
  active_sessions: number;
  revenue?: number;
  last_activity: string;
  created_at?: string;
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
  company_id: string | number;
  activity_type: 'client_added' | 'client_removed' | 'profile_update' | 'other';
  description?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ICompanyActivityFilter {
  company_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}

// --- ICompany Configuration Types ---------------------------------------------

export interface ICompanyConfig {
  company_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateCompanyConfigPayload {
  company_id: string | number;
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
  company_id: string | number;
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
