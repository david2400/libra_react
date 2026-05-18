import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

// Basic company interface - replace with actual company types when available
export interface ICompany {
  id_company: number;
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// --- ICompanyApplication Types -------------------------------------------------------------

export interface ICompanyApplication extends IAuditInfo {
  id_company_application: number;
  company_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
  company?: ICompany;
  application?: IApplication;
}

export interface ICreateCompanyApplicationPayload {
  company_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface IUpdateCompanyApplicationPayload {
  company_id?: number;
  application_id?: number;
  license_start_date?: string;
  license_end_date?: string;
  is_active?: boolean;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface ICompanyApplicationParams extends ListParams {
  company_id?: number;
  application_id?: number;
  is_active?: boolean;
  subscription_type?: string;
}

// --- Repository and Query Types -----------------------------------------------------------

export interface ICompanyApplicationRepository {
  findAll(params?: ICompanyApplicationParams): Promise<IPaginatedResponse<ICompanyApplication>>;
  findById(id: number): Promise<ICompanyApplication | null>;
  findByCompanyIdAndApplicationId(companyId: number, applicationId: number): Promise<ICompanyApplication | null>;
  create(data: ICreateCompanyApplicationPayload): Promise<ICompanyApplication>;
  update(id: number, data: IUpdateCompanyApplicationPayload): Promise<ICompanyApplication>;
  delete(id: number): Promise<void>;
}

export interface ICompanyApplicationQueries {
  findAll(params?: ICompanyApplicationParams): Promise<IPaginatedResponse<ICompanyApplication>>;
  findById(id: number): Promise<ICompanyApplication | null>;
  findByCompanyIdAndApplicationId(companyId: number, applicationId: number): Promise<ICompanyApplication | null>;
}
