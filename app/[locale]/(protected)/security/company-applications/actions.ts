'use server';

import { IApplication, getApplications } from "@/server/domains/access-control/security/applications";
import { ICreateCompanyApplication, IUpdateCompanyApplication, createCompanyApplicationAction, deleteCompanyApplicationAction, updateCompanyApplicationAction } from "@/server/domains/access-control/security/company_applications";

export async function createCompanyApplicationServerAction(payload: ICreateCompanyApplication) {
  const result = await createCompanyApplicationAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear el módulo de aplicación');
  }

  return result.data;
}

export async function updateCompanyApplicationServerAction(companyApplicationId: string | number, payload: IUpdateCompanyApplication) {
  const result = await updateCompanyApplicationAction(companyApplicationId, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar el módulo de aplicación');
  }

  return result.data;
}

export async function deleteCompanyApplicationServerAction(companyApplicationId: string | number) {
  const result = await deleteCompanyApplicationAction(companyApplicationId);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar el módulo de aplicación');
  }

  return result.data;
}


export async function getAllCompaniesServerAction(): Promise<IApplication[]> {
  const result = await getApplications();

  return result.data ?? [];
}
