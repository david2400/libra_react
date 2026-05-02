import type { companies } from '@/server/domains/access-control/account';

export type ICompanyCreateRequest = companies.ICreateCompanyPayload;
export type ICompanyUpdateRequest = companies.IUpdateCompanyPayload & { id: string | number };
export type ICompany = companies.ICompany;
