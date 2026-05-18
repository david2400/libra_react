import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IClient } from '../clients';

// --- ICompany Types -------------------------------------------------------------

export interface ICompany extends IAuditInfo {
  id_company: number;
  name: string;
  nit: string;
  active_date: string;
  status: string;
  // Información de contacto
  email?: string;
  phone?: string;
  website?: string;
  contact_person?: string;
  // Dirección
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  // Datos fiscales y legales
  legal_representative?: string;
  tax_regime?: string;
  economic_activity?: string;
  employee_count?: number;
  // Configuración y estado
  timezone?: string;
  currency?: string;
  language?: string;
  is_active?: boolean;
  is_verified?: boolean;
  verification_date?: string;
  // Límites y configuración del plan
  max_users?: number;
  max_applications?: number;
  subscription_type?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

export interface ICreateCompany {
  name: string;
  nit: string;
  active_date: string;
  status: string;
  // Información de contacto
  email?: string;
  phone?: string;
  website?: string;
  contact_person?: string;
  // Dirección
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  // Datos fiscales y legales
  legal_representative?: string;
  tax_regime?: string;
  economic_activity?: string;
  employee_count?: number;
  // Configuración y estado
  timezone?: string;
  currency?: string;
  language?: string;
  is_active?: boolean;
  is_verified?: boolean;
  verification_date?: string;
  // Límites y configuración del plan
  max_users?: number;
  max_applications?: number;
  subscription_type?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

export interface IUpdateCompany extends ICreateCompany {
  id_company: number;
}



export interface ICompanyClient {
  company_id: string | number;
  client_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
  company?: ICompany;
  client?: IClient;
}

export interface ICreateCompanyClient {
  company_id: string | number;
  client_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
}

export interface IUpdateCompanyClient {
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

export interface ICreateCompanyConfig {
  company_id: string | number;
  key: string;
  value: string | number | boolean;
  description?: string;
  is_encrypted?: boolean;
}

export interface IUpdateCompanyConfig {
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
