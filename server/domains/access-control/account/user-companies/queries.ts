import 'server-only';
import { cache } from 'react';
import { userCompaniesRepository } from './repository';
import type { IUserCompanyListParams } from './types';

// --- User-Companies Queries ---------------------------------------------------------

/**
 * Obtener todas las empresas de un usuario
 * @param userId - ID del usuario
 */
export const getUserCompanies = cache((userId: number) => 
  userCompaniesRepository.getUserCompanies(userId)
);

/**
 * Obtener empresas activas de un usuario
 * @param userId - ID del usuario
 */
export const getUserActiveCompanies = cache((userId: number) => 
  userCompaniesRepository.getUserActiveCompanies(userId)
);

/**
 * Obtener todos los usuarios de una empresa
 * @param companyId - ID de la empresa
 */
export const getCompanyUsers = cache((companyId: number) => 
  userCompaniesRepository.getCompanyUsers(companyId)
);

/**
 * Obtener usuarios activos de una empresa
 * @param companyId - ID de la empresa
 */
export const getCompanyActiveUsers = cache((companyId: number) => 
  userCompaniesRepository.getCompanyActiveUsers(companyId)
);
