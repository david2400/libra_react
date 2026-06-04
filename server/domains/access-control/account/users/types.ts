import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';

// --- IUser Types ---------------------------------------------------------


export interface ICreateUser {
  username: string;
  password: string;
  last_login?: string;
  refresh_token?: string;
  status?: string;
  company_id?: number;
  client_id?: number;
}

export interface IUpdateUser extends ICreateUser {
  id_user?: number;
}


export interface IUser extends IAuditInfo, IUpdateUser {
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
