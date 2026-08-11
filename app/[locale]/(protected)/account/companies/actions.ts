'use server';


import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
  type ICreateCompany,
  type IUpdateCompany,
  getCompanies,
  ICompany,
} from '@/server/domains/access-control/account/companies';

export async function createCompanyServerAction(payload: ICreateCompany) {
  try {
    const result = await createCompanyAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear la empresa');
    }

    return result.data;
  } catch (error) {
    throw error;
  }

}

export async function updateCompanyServerAction(id: number, payload: IUpdateCompany) {
  try {
    const result = await updateCompanyAction(id, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar la empresa');
    }

    return result.data;
  } catch (error) {
    throw error;
  }

}

export async function deleteCompanyServerAction(id: number) {
  try {
    const result = await deleteCompanyAction(id);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar la empresa');
    }

    return result.data;
  } catch (error) {
    throw error;
  }

}

export async function getAllCompaniesServerAction(): Promise<ICompany[]> {
  try {
    const result = await getCompanies();

    return Array.isArray(result)
      ? result
      : result?.content || [];

  } catch (error) {
    throw error;
  }
}
