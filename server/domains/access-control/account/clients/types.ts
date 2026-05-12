import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- Client Types -------------------------------------------------------------

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

export interface ICreateClientPayload {
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface IUpdateClientPayload {
  name?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  contact_person?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active?: boolean;
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
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// --- Client-ICompany Relationships Types ---------------------------------------

export interface IClientCompany {
  client_id: string | number;
  company_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
  client?: IClient;
  company?: ICompany;
}

export interface ICreateClientCompanyPayload {
  client_id: string | number;
  company_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
}

export interface IUpdateClientCompanyPayload {
  is_primary?: boolean;
  relationship_type?: string;
}

// --- Client Authentication Types ---------------------------------------------

export interface IClientAuth {
  client_id: string | number;
  username: string;
  password_hash?: string;
  last_login?: string;
  is_active?: boolean;
  login_attempts?: number;
  locked_until?: string;
}

export interface IClientLoginRequest {
  username: string;
  password: string;
}

export interface IClientLoginResponse {
  token: string;
  refresh_token?: string;
  client: IClient;
  expires_in?: number;
}

export interface IClientRefreshTokenRequest {
  refresh_token: string;
}

export interface IClientRefreshTokenResponse {
  token: string;
  refresh_token?: string;
  expires_in?: number;
}

// --- Client Statistics Types ---------------------------------------------

export interface IClientStats {
  client_id: string | number;
  total_users: number;
  active_sessions: number;
  login_count: number;
  last_activity: string;
  created_at?: string;
}

export interface IClientOverview {
  client: IClient;
  companies: ICompany[];
  stats: IClientStats;
  primary_company?: ICompany;
}

// --- Client Activity Types -------------------------------------------------

export interface IClientActivity {
  id: string | number;
  client_id: string | number;
  activity_type: 'login' | 'logout' | 'password_change' | 'profile_update' | 'other';
  description?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface IClientActivityFilter {
  client_id?: string | number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
}
