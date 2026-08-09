import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

// --- ICompanyApplication Types -------------------------------------------------------------


export interface ICreateCompanyApplication {
  company_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  user_limit?: number;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface IUpdateCompanyApplication extends ICreateCompanyApplication {
  id_company_application: number;
}

export interface ICompanyApplicationParams extends ListParams {
  company_id?: number;
  application_id?: number;
  subscription_type?: string;
}

export interface ICompanyApplication extends IUpdateCompanyApplication {
  // company?: ICompany;
  // application?: IApplication;
}

// --- Repository and Query Types -----------------------------------------------------------

export interface ICompanyApplicationRepository {
  findAll(params?: ICompanyApplicationParams): Promise<IPaginatedResponse<ICompanyApplication>>;
  findById(id: number): Promise<ICompanyApplication | null>;
  findByCompanyIdAndApplicationId(companyId: number, applicationId: number): Promise<ICompanyApplication | null>;
  create(data: ICreateCompanyApplication): Promise<ICompanyApplication>;
  update(id: number, data: IUpdateCompanyApplication): Promise<ICompanyApplication>;
  delete(id: number): Promise<void>;
}

export interface ICompanyApplicationQueries {
  findAll(params?: ICompanyApplicationParams): Promise<IPaginatedResponse<ICompanyApplication>>;
  findById(id: number): Promise<ICompanyApplication | null>;
  findByCompanyIdAndApplicationId(companyId: number, applicationId: number): Promise<ICompanyApplication | null>;
}
