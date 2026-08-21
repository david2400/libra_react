'use server';



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
import { getUsers, IUser } from '@/server/domains/access-control/account/users';
import { getCompanies } from '@/server/domains/access-control/account/companies';
import { IUserApplication } from '@/modules/security/user-application/models/user-application.interface';

export async function createUserCompanyServerAction(payload: ICreateUserCompany) {
  try {
    const result = await createUserCompanyAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear la asignación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function updateUserCompanyServerAction(
  userId: number,
  companyId: number,
  payload: IUpdateUserCompany
) {
  try {
    const result = await updateUserCompanyAction(userId, companyId, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar la asignación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function deleteUserCompanyServerAction(userId: number, companyId: number) {
  try {
    const result = await deleteUserCompanyAction(userId, companyId);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar la asignación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
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



export async function getUsersServerAction(): Promise<IUser[]> {
  try {
    const result = await getUsers({ per_page: 100 });
    console.log('Users result:', result);

    if (!result) {
      console.error('Result is undefined or null');
      return [];
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }

    console.error('Unexpected result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function getCompaniesServerAction() {
  try {
    const result = await getCompanies({ per_page: 100 });
    console.log('Companies result:', result);

    if (!result) {
      console.error('Result is undefined or null');
      return [];
    }

    if (Array.isArray(result)) {
      return result;
    }

    if (result.content && Array.isArray(result.content)) {
      return result.content;
    }

    console.error('Unexpected result structure:', result);
    return [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}
