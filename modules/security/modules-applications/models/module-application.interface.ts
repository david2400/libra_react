// TODO: Fix server domain exports for modules-applications
// import type { modulesApplications } from '@/server/domains/access-control/security';

// export type IModuleApplicationCreateRequest = modulesApplications.ICreateModuleApplication;
// export type IModuleApplicationUpdateRequest = modulesApplications.IUpdateModuleApplication;
// export type IModuleApplication = modulesApplications.IModuleApplication;

// Temporary types to allow build
export interface IModuleApplication {
  id_modules_application?: number;
  name: string;
  description: string;
  application_id: number;
  parent_module_application_id?: number;
  publication_date: Date;
  level: number;
  path: string;
  parent_module_application?: IModuleApplication[];
  deleted?: boolean;
  application?: { name: string };
}

export interface IModuleApplicationCreateRequest {
  name: string;
  description: string;
  application_id: number;
  parent_module_application_id?: number;
  publication_date: Date;
  level: number;
  path: string;
}

export interface IModuleApplicationUpdateRequest extends IModuleApplicationCreateRequest {
  id_modules_application: number;
}
