import 'server-only';
import type { ListParams, IPaginatedResponse, IAuditInfo } from '@/server/lib/types';
import { IApplication } from '../applications';

// --- IUserApplication Types -------------------------------------------------------------

export interface IUserApplication extends IAuditInfo {
  id_user_application: number;
  user_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  access_level?: string;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
  // user?: IUser;
  // application?: IApplication;
}

export interface ICreateUserApplication {
  user_id: number;
  application_id: number;
  license_start_date: string;
  license_end_date: string;
  is_active: boolean;
  access_level?: string;
  subscription_type?: string;
  auto_renew?: boolean;
  notes?: string;
}

export interface IUpdateUserApplication extends ICreateUserApplication {
  id_user_application?: number;
}

export interface IUserApplicationParams extends ListParams {
  user_id?: number;
  application_id?: number;
  is_active?: boolean;
  subscription_type?: string;
  access_level?: string;
}

// --- Repository and Query Types -----------------------------------------------------------

export interface IUserApplicationRepository {
  findAll(params?: IUserApplicationParams): Promise<IPaginatedResponse<IUserApplication>>;
  findById(id: number): Promise<IUserApplication | null>;
  findByUserIdAndApplicationId(userId: number, applicationId: number): Promise<IUserApplication | null>;
  create(data: ICreateUserApplication): Promise<IUserApplication>;
  update(id: number, data: IUpdateUserApplication): Promise<IUserApplication>;
  delete(id: number): Promise<void>;
}

export interface IUserApplicationQueries {
  findAll(params?: IUserApplicationParams): Promise<IPaginatedResponse<IUserApplication>>;
  findById(id: number): Promise<IUserApplication | null>;
  findByUserIdAndApplicationId(userId: number, applicationId: number): Promise<IUserApplication | null>;
}
