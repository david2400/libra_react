'use server';

import { IApplication, getApplications } from "@/server/domains/access-control/security/applications";
import { ICompanyApplication, ICreateCompanyApplication, IUpdateCompanyApplication, createCompanyApplicationAction, deleteCompanyApplicationAction, getCompanyApplications, revokeAllApplicationsAction, updateCompanyApplicationAction } from "@/server/domains/access-control/security/company_applications";

export async function createCompanyApplicationServerAction(payload: ICreateCompanyApplication) {
  try {
    const result = await createCompanyApplicationAction(payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo crear el módulo de aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function updateCompanyApplicationServerAction(companyApplicationId: string | number, payload: IUpdateCompanyApplication) {
  try {
    const result = await updateCompanyApplicationAction(companyApplicationId, payload);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo actualizar el módulo de aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function deleteCompanyApplicationServerAction(companyApplicationId: string | number) {
  try {
    const result = await deleteCompanyApplicationAction(companyApplicationId);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar el módulo de aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}

export async function revokeAllApplicationsActionServerAction(companyId: number) {
  try {
    const result = await revokeAllApplicationsAction(companyId);

    if (!result.success) {
      throw new Error(result.error?.message ?? 'No se pudo eliminar el módulo de aplicación');
    }

    return result.data;

  } catch (error) {
    throw error;
  }
}


export async function getAllCompaniesServerAction(): Promise<IApplication[]> {
  try {
    const result = await getApplications();

    return result ?? [];

  } catch (error) {
    throw error;
  }
}

export async function getCompanyApplicationsServerAction(): Promise<ICompanyApplication[]> {
  try {
    const result = await getCompanyApplications();

    return Array.isArray(result)
      ? result
      : (result as any)?.content || [];

  } catch (error) {
    throw error;
  }
}
