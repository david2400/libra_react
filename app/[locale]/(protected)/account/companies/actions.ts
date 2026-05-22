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
  const result = await createCompanyAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear la empresa');
  }

  return result.data;
}

export async function updateCompanyServerAction(id: string | number, payload: IUpdateCompany) {
  const result = await updateCompanyAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar la empresa');
  }

  return result.data;
}

export async function deleteCompanyServerAction(id: string | number) {
  const result = await deleteCompanyAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar la empresa');
  }

  return result.data;
}

export async function getAllCompaniesServerAction(): Promise<ICompany[]> {
  const result = await getCompanies();

  return Array.isArray(result)
    ? result
    : result?.data || [];
}
