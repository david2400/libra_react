import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IUser } from '../users';
import { ICompany } from '../companies';

// --- User-Company Types -------------------------------------------------------------

/**
 * Payload para crear una nueva asignación de usuario a empresa
 */
export interface ICreateUserCompany {
  user_id: number;
  company_id: number;
  is_primary?: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
}

/**
 * Payload para actualizar una asignación existente
 */
export interface IUpdateUserCompany extends Partial<ICreateUserCompany> {

}

/**
 * Interface principal de UserCompany
 * Representa la relación entre un usuario y una empresa
 */
export interface IUserCompany extends IAuditInfo, IUpdateUserCompany {
  user: IUser;
  company: ICompany;
}

/**
 * Response DTO con información adicional de la empresa
 */
export interface IUserCompanyResponse {
  user_id: number;
  company_id: number;
  company_name?: string;
  company_nit?: string;
  is_primary: boolean;
  access_level?: string;
  expires_at?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

// --- List Types -------------------------------------------------

export interface IUserCompanyListParams extends ListParams {
  user_id?: number;
  company_id?: number;
  is_primary?: boolean;
}

