import type { companies } from '@/server/domains/access-control/account';

export type ICompanyCreateRequest = companies.ICreateCompany;
export type ICompanyUpdateRequest = companies.IUpdateCompany & { id: string | number };
export type ICompany = companies.ICompany;
