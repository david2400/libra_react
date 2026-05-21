import type { companyApplications } from '@/server/domains/access-control/security';
// Client-side interfaces for Company Applications
// These match the server types but are optimized for client usage



export type ICompanyApplicationCreateRequest = companyApplications.ICreateCompanyApplication;
export type ICompanyApplicationUpdateRequest = companyApplications.IUpdateCompanyApplication;
export type ICompanyApplication = companyApplications.ICompanyApplication;
// export type IPolicyRule = companyApplications.IPolicyRule;
