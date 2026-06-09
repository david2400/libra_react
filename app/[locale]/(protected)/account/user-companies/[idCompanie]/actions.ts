"use server";

import {
  createUserCompanyAction,
  updateUserCompanyAction,
  deleteUserCompanyAction,
  getUserCompanies,
  getUserActiveCompanies,
  getCompanyUsers,
  getCompanyActiveUsers,
} from '@/server/domains/access-control/account/user-companies';
import type {
  IUserCompany,
  IUserCompanyResponse,
  ICreateUserCompany,
  IUpdateUserCompany,
  IUserCompanyListParams,
} from '@/server/domains/access-control/account/user-companies';

export async function createUserCompanyServerAction(payload: ICreateUserCompany) {
  const result = await createUserCompanyAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear la asignación');
  }

  return result.data;
}

export async function updateUserCompanyServerAction(
  userId: number,
  companyId: number,
  payload: IUpdateUserCompany
) {
  const result = await updateUserCompanyAction(userId, companyId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar la asignación');
  }

  return result.data;
}

export async function deleteUserCompanyServerAction(userId: number, companyId: number) {
  const result = await deleteUserCompanyAction(userId, companyId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar la asignación');
  }

  return result.data;
}

export async function getUserCompaniesServerAction(userId: number): Promise<IUserCompanyResponse[]> {
  try {
    const result = await getUserCompanies(userId);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch user companies:", error);
    return [];
  }
}

export async function getUserActiveCompaniesServerAction(userId: number): Promise<IUserCompanyResponse[]> {
  try {
    const result = await getUserActiveCompanies(userId);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch user active companies:", error);
    return [];
  }
}

export async function getCompanyUsersServerAction(companyId: number): Promise<IUserCompanyResponse[]> {
  try {
    const result = await getCompanyUsers(companyId);
    console.log(result);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch company users:", error);
    return [];
  }
}

export async function getCompanyActiveUsersServerAction(companyId: number): Promise<IUserCompanyResponse[]> {
  try {
    const result = await getCompanyActiveUsers(companyId);
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Failed to fetch company active users:", error);
    return [];
  }
}
