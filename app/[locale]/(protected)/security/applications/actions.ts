"use server";

import {
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction,
  getApplications,
} from '@/server/domains/access-control/security/applications';
import type {
  IApplication,
  ICreateApplication,
  IUpdateApplication,
} from '@/server/domains/access-control/security/applications';

export async function createApplicationServerAction(payload: ICreateApplication) {
  const result = await createApplicationAction(payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo crear la aplicación');
  }

  return result.data;
}

export async function updateApplicationServerAction(id: string | number, payload: IUpdateApplication) {
  const result = await updateApplicationAction(id, payload);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo actualizar la aplicación');
  }

  return result.data;
}

export async function deleteApplicationServerAction(id: string | number) {
  const result = await deleteApplicationAction(id);

  if (!result.success) {
    throw new Error(result.error?.message ?? 'No se pudo eliminar la aplicación');
  }

  return result.data;
}


export async function getAllApplicationsServerAction(): Promise<IApplication[]> {
  const result = await getApplications();

  return Array.isArray(result)
    ? result
    : result?.data || [];
}