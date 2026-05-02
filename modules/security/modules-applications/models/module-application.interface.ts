import type { modulesApplications } from '@/server/domains/access-control/security';

export type IModuleApplicationCreateRequest = modulesApplications.ICreateModuleApplicationPayload;
export type IModuleApplicationUpdateRequest = modulesApplications.IUpdateModuleApplicationPayload & { moduleId: string | number; applicationId: string | number };
export type IModuleApplication = modulesApplications.IModuleApplication;
export type IModule = modulesApplications.IModule;
export type IApplication = modulesApplications.IApplication;
