'use server';


import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
  type ICreateCompanyPayload,
  type IUpdateCompanyPayload,
} from '@/server/domains/access-control/account/companies';

export async function createCompanyServerAction(payload: ICreateCompanyPayload) {
  const result = await createCompanyAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear la empresa');
  }

  return result.data;
}

export async function updateCompanyServerAction(id: string | number, payload: IUpdateCompanyPayload) {
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
