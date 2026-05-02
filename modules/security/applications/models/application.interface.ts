import type { applications } from '@/server/domains/access-control/security';

export type IApplicationCreateRequest = applications.ICreateApplicationPayload;
export type IApplicationUpdateRequest = applications.IUpdateApplicationPayload & { id: string | number };
export type IApplication = applications.IApplication;
