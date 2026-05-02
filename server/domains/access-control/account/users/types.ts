import 'server-only';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- IUser Types ---------------------------------------------------------

export interface IUser {
  id_user: number;
  username: string;
  password: string;
  lastLogin?: string;
  refreshToken?: string;
  status: string;
  companyId?: number;
  clientId?: number;
  activo?: boolean;
  usr_crea?: number;
  usr_mod?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateUserPayload {
  username: string;
  password: string;
  lastLogin?: string;
  refreshToken?: string;
  status?: string;
  companyId?: number;
  clientId?: number;
}

export interface IUpdateUserPayload {
  username?: string;
  password?: string;
  lastLogin?: string;
  refreshToken?: string;
  status?: string;
  companyId?: number;
  clientId?: number;
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
