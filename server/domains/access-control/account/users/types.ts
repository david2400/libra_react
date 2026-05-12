import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IUser Types ---------------------------------------------------------

export interface IUser {
  id_user: number;
  username: string;
  password: string;
  last_login?: string;
  refresh_token?: string;
  status: string;
  company_id?: number;
  client_id?: number;
  activo?: boolean;
  usr_crea?: number;
  usr_mod?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ICreateUserPayload {
  username: string;
  password: string;
  last_login?: string;
  refresh_token?: string;
  status?: string;
  company_id?: number;
  client_id?: number;
}

export interface IUpdateUserPayload {
  username?: string;
  password?: string;
  last_login?: string;
  refresh_token?: string;
  status?: string;
  company_id?: number;
  client_id?: number;
  activo?: boolean;
  usr_mod?: number;
}

// --- IUser List Types -------------------------------------------------

export interface IUserListParams extends ListParams {
  username?: string;
}

export interface IUserListResponse {
  users: IUser[];
  total: number;
  page: number;
  per_page: number;
}
