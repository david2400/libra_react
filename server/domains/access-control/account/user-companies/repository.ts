import 'server-only';

import { serverFetch } from '@/server/lib';
import { accessControlTags } from '@/server/lib/cache-tags';
import type { 
  IUserCompany,
  IUserCompanyResponse,
  IUserCompanyListParams,
  ICreateUserCompany,
  IUpdateUserCompany
} from './types';
import type { ListParams, IPaginatedResponse } from '@/server/lib/types';

// --- User-Companies Repository ---------------------------------------------------------

export const userCompaniesRepository = {
  /**
   * Asignar un usuario a una empresa
   * POST /api/access_control/user-companies
   */
  create: (payload: ICreateUserCompany) => 
    serverFetch.post<IUserCompanyResponse>('/api/access_control/user-companies', payload, {
      revalidate: false,
      tags: [accessControlTags.users(), accessControlTags.companies()],
    }),

  /**
   * Actualizar una asignación de usuario a empresa
   * PUT /api/access_control/user-companies/user/{userId}/company/{companyId}
   */
  update: (userId: number, companyId: number, payload: IUpdateUserCompany) => 
    serverFetch.put<IUserCompanyResponse>(
      `/api/access_control/user-companies/user/${userId}/company/${companyId}`, 
      payload, 
      {
        revalidate: false,
        tags: [accessControlTags.user(userId), accessControlTags.company(companyId)],
      }
    ),

  /**
   * Eliminar una asignación de usuario a empresa
   * DELETE /api/access_control/user-companies/user/{userId}/company/{companyId}
   */
  delete: (userId: number, companyId: number) => 
    serverFetch.delete<void>(
      `/api/access_control/user-companies/user/${userId}/company/${companyId}`, 
      {
        revalidate: false,
        tags: [accessControlTags.user(userId), accessControlTags.company(companyId)],
      }
    ),

  /**
   * Obtener todas las empresas de un usuario
   * GET /api/access_control/user-companies/user/{userId}
   */
  getUserCompanies: (userId: number) => 
    serverFetch.get<IUserCompanyResponse[]>(
      `/api/access_control/user-companies/user/${userId}`, 
      {
        revalidate: 120,
        tags: [accessControlTags.user(userId)],
      }
    ),

  /**
   * Obtener empresas activas de un usuario
   * GET /api/access_control/user-companies/user/{userId}/active
   */
  getUserActiveCompanies: (userId: number) => 
    serverFetch.get<IUserCompanyResponse[]>(
      `/api/access_control/user-companies/user/${userId}/active`, 
      {
        revalidate: 60,
        tags: [accessControlTags.user(userId)],
      }
    ),

  /**
   * Obtener todos los usuarios de una empresa
   * GET /api/access_control/user-companies/company/{companyId}
   */
  getCompanyUsers: (companyId: number) => 
    serverFetch.get<IUserCompanyResponse[]>(
      `/api/access_control/user-companies/company/${companyId}`, 
      {
        revalidate: 120,
        tags: [accessControlTags.company(companyId)],
      }
    ),

  /**
   * Obtener usuarios activos de una empresa
   * GET /api/access_control/user-companies/company/{companyId}/active
   */
  getCompanyActiveUsers: (companyId: number) => 
    serverFetch.get<IUserCompanyResponse[]>(
      `/api/access_control/user-companies/company/${companyId}/active`, 
      {
        revalidate: 60,
        tags: [accessControlTags.company(companyId)],
      }
    ),
} as const;
