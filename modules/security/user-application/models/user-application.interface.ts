import type { userApplications } from '@/server/domains/access-control/security';
// Client-side interfaces for User Applications
// These match the server types but are optimized for client usage

export type IUserApplicationCreateRequest = userApplications.ICreateUserApplication;
export type IUserApplicationUpdateRequest = userApplications.IUpdateUserApplication;
export type IUserApplication = userApplications.IUserApplication;
