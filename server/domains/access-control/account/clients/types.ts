import type { ListParams, IPaginatedResponse } from '@/server/lib/types';
import type { IAuditInfo } from '@/server/lib/types';
import type { ICompany } from '../companies';

// --- Client Types -------------------------------------------------------------


/**
 * Payload para crear un nuevo cliente
 * Todos los campos obligatorios según la entidad
 */
export interface ICreateClient {
  first_name: string;
  second_name?: string;
  first_last_name: string;
  second_last_name?: string;
  type_id: string;
  card_id: string;
  sex: string;
  gender: string;
  status?: string;
}

/**
 * Payload para actualizar un cliente existente
 * Todos los campos son opcionales excepto el ID
 */
export interface IUpdateClient {
  id_client?: number;
  first_name?: string;
  second_name?: string;
  first_last_name?: string;
  second_last_name?: string;
  type_id?: string;
  card_id?: string;
  sex?: string;
  gender?: string;
  status?: string;
}



/**
 * Interface principal de Client basada en la entidad del backend
 * Representa una persona (cliente) con información personal completa
 */
export interface IClient extends IAuditInfo, IUpdateClient {
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

export interface ICreateClientCompany {
  client_id: string | number;
  company_id: string | number;
  is_primary?: boolean;
  relationship_type?: string;
}

export interface IUpdateClientCompany {
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
